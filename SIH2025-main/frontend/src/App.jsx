import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
// Student Components
import StudentLogin from "./components/StudentLogin.jsx";
import StudentRegister from "./components/StudentRegister.jsx";
import StudentDashboard from './components/StudentDashboard.jsx'; 
import Test from "./components/Test.jsx";
import TestResults from "./components/TestResults.jsx";
// Teacher Components
import TeacherLogin from "./components/TeacherLogin.jsx";
import TeacherRegister from "./components/TeacherRegister.jsx";
import TeacherHub from "./components/TeacherDashboard.jsx"; 
import TeacherAddQuestions from "./components/TeacherAddQuestions.jsx"; 
import "./styles.css"; 


export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("session");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse session from localStorage", e);
      return null;
    }
  });

  const navigate = useNavigate();

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem("session", JSON.stringify(session));
    } else {
      localStorage.removeItem("session");
    }
  }, [session]);

  function handleLogin(user) {
    setSession(user); 
    
    // Redirect logic based on role after successful login
    if (user?.role === 'student') {
        navigate("/student-dashboard");
    } else if (user?.role === 'teacher') {
        navigate("/teacher-hub");
    } else {
        navigate("/");
    }
  }

  function signOut() {
    setSession(null);
    localStorage.removeItem("session");
    navigate("/");
  }

  // A helper component to protect routes
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!session) {
      return <LandingPage />;
    }
    // Optional: Add a check for user roles to protect routes.
    if (requiredRole && session.role !== requiredRole) {
      console.warn(`Access denied. User role is '${session.role}', required is '${requiredRole}'`);
      return <LandingPage />;
    }
    return children;
  };

  return (
    <div className="wrap">
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* ------------------- Student Pages ------------------- */}
        <Route path="/studentLogin" element={<StudentLogin onLogin={handleLogin} />} />
        <Route path="/studentRegister" element={<StudentRegister />} />
        
        {/* Student Dashboard (Protected Route) */}
        <Route
      path="/student-dashboard" element={ <ProtectedRoute requiredRole="student">
          <StudentDashboard session={session} /> </ProtectedRoute>}/>
    <Route
      path="/test/:testId"
element={
        <ProtectedRoute requiredRole="student">
          <Test session={session} />
        </ProtectedRoute>
      }
    />
    <Route
      path="/testresults"
      element={
        <ProtectedRoute requiredRole="student">
          <TestResults session={session} />
        </ProtectedRoute>
      }
    />
    <Route
      path="/testresults/:testId"
      element={
        <ProtectedRoute requiredRole="student">
          <TestResults session={session} />
        </ProtectedRoute>
      }
    />

        {/* ------------------- Teacher Pages ------------------- */}
        <Route path="/teacherLogin" element={<TeacherLogin onLogin={handleLogin} />} />
        <Route path="/teacherRegister" element={<TeacherRegister />} />
        <Route path="/teacher-hub" element={<TeacherHub session={session} onLogout={signOut} />} />
        <Route path="/addquestion" element={<TeacherAddQuestions session={session} />} />
        <Route path="/teacher" element={<TeacherHub session={session} onLogout={signOut} />} />
        </Routes>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { Routes, Route, useNavigate } from "react-router-dom";
// // NOTE: Assuming LandingPage.jsx is imported from './LandingPage' since it's a sibling of the components folder.
// import LandingPage from "./LandingPage.jsx"; 

// // Student Components
// import StudentLogin from "./components/StudentLogin.jsx";
// import StudentRegister from "./components/StudentRegister.jsx";
// import StudentDashboard from './components/StudentDashboard.jsx'; // 👈 Correct
// import Test from "./components/Test.jsx";
// import TestResults from "./components/TestResults.jsx";

// // Teacher Components
// import TeacherLogin from "./components/TeacherLogin.jsx";
// import TeacherRegister from "./components/TeacherRegister.jsx";
// import TeacherHub from "./components/TeacherDashboard.jsx"; 
// import TeacherAddQuestions from "./components/TeacherAddQuestions.jsx"; 

// // NOTE: You should also import any CSS files if they are not already imported in the components themselves.
// import "./styles.css"; 


// export default function App() {
//   const [session, setSession] = useState(() => {
//     try {
//       const saved = localStorage.getItem("session");
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       console.error("Failed to parse session from localStorage", e);
//       return null;
//     }
//   });

//   const navigate = useNavigate();

//   // Save session to localStorage whenever it changes
//   useEffect(() => {
//     if (session) {
//       localStorage.setItem("session", JSON.stringify(session));
//     } else {
//       localStorage.removeItem("session");
//     }
//   }, [session]);

//   function handleLogin(user) {
//     setSession(user); 
    
//     // Redirect logic based on role after successful login
//     if (user?.role === 'student') {
//         navigate("/student-dashboard");
//     } else if (user?.role === 'teacher') {
//         navigate("/teacher-hub");
//     } else {
//         navigate("/");
//     }
//   }

//   function signOut() {
//     setSession(null);
//     localStorage.removeItem("session");
//     navigate("/");
//   }
//    const ProtectedRoute = ({ children, requiredRole }) => {
//     if (!session) {
//       return <LandingPage />;
//     }
//     // Optional: Add a check for user roles to protect routes.
//     if (requiredRole && session.role !== requiredRole) {
//       console.warn(`Access denied. User role is '${session.role}', required is '${requiredRole}'`);
//       return <LandingPage />;
//     }
//     return children;
//   };
//   return (
//     <div className="wrap">
//       <Routes>
//         {/* Landing page */}
//         <Route path="/" element={<LandingPage />} />

//         {/* ------------------- Student Pages ------------------- */}
//         <Route path="/studentLogin" element={<StudentLogin onLogin={handleLogin} />} />
//         <Route path="/studentRegister" element={<StudentRegister />} />
//         <Route
//           // 🎯 CORRECT ROUTE: The student's first stop after logging in
//           path="/student-dashboard"
//           element={<StudentDashboard session={session} />}
//         />
//         <Route
//           // Test page with a dynamic ID to prevent direct access
//           path="/test/:testId"
//           element={<Test session={session} />}
//         />
//         <Route
//           // Test results page with an optional dynamic ID
//           path="/testresults"
//           element={<TestResults session={session} />}
//         />
//         <Route
//           path="/testresults/:testId"
//           element={<TestResults session={session} />}
//         />

        
        

//         <Route path="/teacherLogin" element={<TeacherLogin onLogin={handleLogin} />} />
//         <Route path="/teacherRegister" element={<TeacherRegister />} />
//         <Route path="/teacher-hub" element={<TeacherHub session={session} onLogout={signOut} />} />
//         <Route path="/addquestion" element={<TeacherAddQuestions session={session} />} />
//         <Route path="/teacher" element={<TeacherHub session={session} onLogout={signOut} />} />
//       </Routes>
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { Routes, Route, useNavigate } from "react-router-dom";
// import LandingPage from "./LandingPage";
// import StudentLogin from "./components/StudentLogin";
// import TeacherLogin from "./components/TeacherLogin";
// import StudentDashboard from './components/StudentDashboard.jsx';
// import StudentRegister from "./components/StudentRegister";
// import TeacherRegister from "./components/TeacherRegister";
// import Test from "./components/Test";
// import TeacherAddQuestions from "./components/TeacherAddQuestions";
// import TeacherDashboard from "./components/TeacherAddQuestions";
// import TestResults from "./components/TestResults";

// export default function App() {
//   // Load session from browser storage on first load
//   const [session, setSession] = useState(() => {
//     const saved = localStorage.getItem("session");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const navigate = useNavigate();

//   // Save session to localStorage whenever it changes
//   useEffect(() => {
//     if (session) {
//       localStorage.setItem("session", JSON.stringify(session));
//     } else {
//       localStorage.removeItem("session");
//     }
//   }, [session]);

//   function handleLogin(user) {
//     setSession(user); // user comes from FastAPI /login
//   }

//   function signOut() {
//     setSession(null);
//     localStorage.removeItem("session");
//     navigate("/");
//   }

//   return (
//     <div className="wrap">
//       <Routes>
//         {/* Landing page */}
//         <Route path="/" element={<LandingPage />} />

//         {/* Student pages */}
//         <Route path="/studentLogin" element={<StudentLogin onLogin={handleLogin} />} />
//         <Route path="/studentRegister" element={<StudentRegister />} />

//          {/* Student Dashboard (Protected Route) */}
//         <Route 
//           path="/student-dashboard" 
//           element={
//             session ? <StudentDashboard session={session} /> : <LandingPage />
//           } 
//         />

//         <Route
//           path="/test"
//           element={
//             session ? <Test session={session} /> : <LandingPage />
//           }
//         />
//         <Route path="/testresults" element={<TestResults session={session} />} /> 

//         {/* Teacher pages */}
//         <Route path="/teacherLogin" element={<TeacherLogin onLogin={handleLogin} />} />
//         <Route path="/teacherRegister" element={<TeacherRegister />} />
//         <Route
//           path="/teacher"
//           element={
//             session ? <TeacherDashboard session={session} onLogout={signOut} /> : <LandingPage />
//           }
//         />
//       </Routes>
//     </div>
//   );
// }
