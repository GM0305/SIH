from fastapi import FastAPI, Body, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import certifi
import google.generativeai as genai
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import Optional

load_dotenv()

app = FastAPI()

MONGO_URI = os.getenv("MONGO_URI")
GENAI_API_KEY = os.getenv("GENAI_API_KEY")

if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable not set.")
if not GENAI_API_KEY:
    raise ValueError("GENAI_API_KEY environment variable not set.")

genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Allow CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
try:
    client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
    db = client["Smart_Education"]
    student_data = db["students"]
    teacher_data = db["teachers"]
    questions_data = db["questions"]
    results = db["results"]
    quizzes = db["quizzes"]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise

class Question(BaseModel):
    text: str
    options: list[str]
    correct: int

class User(BaseModel):
    username: str
    password: str

class TestResult(BaseModel):
    username: str
    answers: list

@app.post("/studentLogin/", status_code=status.HTTP_200_OK)
def loginStudent(user: User):
    user_doc = student_data.find_one({"username": user.username, "password": user.password})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"username": user_doc["username"], "role": "student"}

@app.post("/teacherLogin/", status_code=status.HTTP_200_OK)
def loginTeacher(user: User):
    user_doc = teacher_data.find_one({"username": user.username, "password": user.password})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"username": user_doc["username"], "role": "teacher"}

@app.post("/studentRegister/", status_code=status.HTTP_201_CREATED)
def registerStudent(user: User):
    existing_user = student_data.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = {"username": user.username, "password": user.password, "role": "student"}
    student_data.insert_one(new_user)
    return {"message": "Student registered successfully", "user": {"username": user.username, "role": "student"}}

@app.post("/teacherRegister/", status_code=status.HTTP_201_CREATED)
def registerTeacher(user: User):
    existing_user = teacher_data.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = {"username": user.username, "password": user.password, "role": "teacher"}
    teacher_data.insert_one(new_user)
    return {"message": "Teacher registered successfully", "user": {"username": user.username, "role": "teacher"}}


@app.get("/questions", status_code=status.HTTP_200_OK)
def get_questions():
    ques = list(questions_data.find({}, {"_id": 0}))
    return {"questions": ques}

@app.post("/addQuestion", status_code=status.HTTP_201_CREATED)
def add_question(question: Question):
    if question.correct < 0 or question.correct >= len(question.options):
        raise HTTPException(status_code=400, detail="Correct option index is out of range")
    questions_data.insert_one(question.model_dump())
    return {"message": "Question added successfully"}

@app.get("/student/availableQuizzes", status_code=status.HTTP_200_OK)
def get_available_tests():
    # Placeholder for available tests
    available_tests = [
        {"id": "test1", "name": "Basic Math Quiz"},
        {"id": "test2", "name": "Science Fundamentals"},
    ]
    return {"tests": available_tests}

@app.get("/student/previousTests/{username}", status_code=status.HTTP_200_OK)
def get_previous_tests(username: str):
    # Placeholder for previous test results
    previous_results = list(results.find({"username": username}, {"_id": 0}))
    return {"results": previous_results}

@app.get("/teacher/testHistory/{username}", status_code=status.HTTP_200_OK)
def get_teacher_test_history(username: str):
    # Placeholder for a teacher's test history
    teacher_history = [
        {"testId": "test1", "name": "Basic Math Quiz", "dateCreated": "2023-01-01T00:00:00Z"},
    ]
    return {"history": teacher_history}

@app.get("/testResults/{username}", status_code=status.HTTP_200_OK)
def get_test_results(username: str):
    result = results.find_one({"username": username}, sort=[("_id", -1)])
    if not result:
        raise HTTPException(status_code=404, detail="No results found")
    detailed_scores = result.get("detailed_scores", [])
    return {
        "username": result["username"],
        "score": result["score"],
        "questions": result["questions"],
        "detailed_scores": detailed_scores
    }

def check_reason(question, correct_answer, teacher_reasons, student_answer, student_reason):
    prompt = f'''
    Question: {question}
    Teacher's Correct Answer: {correct_answer}
    Teacher's Valid Reasons: {teacher_reasons}
    Student's Answer: {student_answer}
    Student's Reason: {student_reason}
    Task:
    1. Compare student's reason with teacher's valid reasons only if teacher reason is provided else skip this.
    2. Give a verdict: "Correct Reason", "Partially Correct Reason", or "Incorrect Reason".
    3. Provide a short explanation.
    Provide this all with ### seperation between each task by which it can be splitted.
    '''
    response = model.generate_content(prompt)
    return response.text

@app.post("/submitTest", status_code=status.HTTP_201_CREATED)
def submit_test(data: TestResult):
    username = data.username
    answers = data.answers
    questions = list(questions_data.find({}, {"_id": 0}))
    score = 0
    detailed_scores = []
    
    for i, ans in enumerate(answers):
        q = questions[i]
        mcq_score = 1 if ans.get("selectedIndex") == q["correct"] else 0
        student_answer = (
            q["options"][ans["selectedIndex"]] if ans.get("selectedIndex") is not None else "No Answer"
        )
        student_reason = ans.get("reasoning", "")
        teacher_correct_answer = q["options"][q["correct"]]
        teacher_reasons = q.get("teacher_reasons", ["Correct reasoning not provided"])
        
        verdict_text = check_reason(q, teacher_correct_answer, teacher_reasons, student_answer, student_reason)
        
        reason_score = 0
        if "Partially Correct Reason" in verdict_text:
            reason_score = 0.5
        elif "Correct Reason" in verdict_text:
            reason_score = 1
        
        total_q_score = mcq_score + reason_score
        score += total_q_score
        
        detailed_scores.append({
            "question": q["text"],
            "student_answer": student_answer,
            "correct_answer": teacher_correct_answer,
            "reasoning": student_reason,
            "verdict": verdict_text,
            "mcq_score": mcq_score,
            "reason_score": reason_score,
            "total": total_q_score
        })
    
    result_doc = {
        "username": username,
        "score": score,
        "answers": answers,
        "questions": questions,
        "detailed_scores": detailed_scores
    }
    results.insert_one(result_doc)
    return {"message": "Test submitted successfully"}
