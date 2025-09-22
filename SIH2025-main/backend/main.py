from fastapi import FastAPI
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body, HTTPException
from pydantic import BaseModel
import certifi
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("GENAI_API")

genai.configure(api_key=SECRET_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

# Allow CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connection_str = MONGO_URI
# MongoDB connection
client = MongoClient(connection_str, tls=True, tlsCAFile=certifi.where())
db = client["Smart_Education"]
student_data = db["students"]
teacher_data = db["teachers"]
questions_data = db["questions"]
results = db["results"]

class Question(BaseModel):
    text: str
    options: list[str]  # e.g., ["Option A", "Option B", ...]
    correct: int

@app.post("/studentLogin/")
def loginStudent(username: str = Body(...), password: str = Body(...)):
    user = student_data.find_one({"username": username, "password": password}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@app.post("/teacherLogin/")
def loginTeacher(username: str = Body(...), password: str = Body(...)):
    user = teacher_data.find_one({"username": username, "password": password}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@app.post("/studentRegister/")
def registerStudent(username: str = Body(...), password: str = Body(...)):
    existing_user = student_data.find_one({"username": username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = {
        "username": username,
        "password": password
    }
    student_data.insert_one(new_user)
    return {"message": "Student registered successfully", "user": {"username": username}}

@app.post("/teacherRegister/")
def registerTeacher(username: str = Body(...), password: str = Body(...)):
    existing_user = teacher_data.find_one({"username": username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = {
        "username": username,
        "password": password
    }
    teacher_data.insert_one(new_user)
    return {"message": "Teacher registered successfully", "user": {"username": username}}

@app.get("/questions")
def get_questions():
    ques = list(questions_data.find({}, {"_id": 0}))  # exclude _id
    return {"questions": ques}

@app.post("/addQuestion")
def add_question(question: Question):
    if question.correct < 0 or question.correct >= len(question.options):
        raise HTTPException(status_code=400, detail="Correct option index is out of range")
    questions_data.insert_one(question.model_dump())
    return {"message": "Question added successfully"}

@app.get("/testResults/{username}")
def get_test_results(username: str):
    # Get the latest result of the student
    result = results.find_one({"username": username}, sort=[("_id", -1)])
    if not result:
        raise HTTPException(status_code=404, detail="No results found")
    # Prepare detailed scores for frontend
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
    1. Check if the student's answer matches the correct answer (Yes/No).
    2. Compare student's reason with teacher's valid reasons.
    3. Give a verdict: "Correct Reason", "Partially Correct Reason", or "Incorrect Reason".
    4. Provide a short explanation.
    '''
    response = model.generate_content(prompt)
    return response.text

@app.post("/submitTest")
def submit_test(data: dict = Body(...)):
    '''
    Expected:
    {
        "username": "student1",
        "answers": [{"selectedIndex":0,"reasoning":"..."}]
    }
    '''
    username = data["username"]
    answers = data["answers"]
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
        # Use Gemini to check reasoning
        verdict_text = check_reason(
            q["text"], teacher_correct_answer, teacher_reasons, student_answer, student_reason
        )
        # Assign score based on verdict
        reason_score = 0
        if "Partially Correct Reason" in verdict_text:
            reason_score = 0.5
        elif "Correct Reason" in verdict_text:
            reason_score = 1
        else:
            reason_score = 0
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