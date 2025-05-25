import React from 'react';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentLoginPage from './pages/StudentLoginPage';
import './App.css'; // Assuming you might have some basic styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>IGCSE Platform</h1>
      </header>
      <main>
        {/* You can switch between these for testing, or implement basic routing */}
        <section>
          <h2>Registration Demo</h2>
          <StudentRegisterPage />
        </section>
        <hr />
        <section>
          <h2>Login Demo</h2>
          <StudentLoginPage />
        </section>
        <hr />
        <section>
          <h2>Subject Selection Demo</h2>
          {/* In a real app, this might only be shown after login */}
          <SubjectSelectionPage />
        </section>
        <hr />
        <section>
          <h2>Exam Page Demo</h2>
          {/* 
            In a real app, examId would come from navigation (e.g., clicking an exam in a list).
            For demo purposes, we pass a hardcoded examId.
            The sample exams created in run.py should have IDs 1 and 2 if the DB is fresh.
            Let's use examId={1} for "Mathematics Paper 1 - Algebra Basics".
          */}
          <ExamPage examIdFromProps={1} />
        </section>
        <hr />
        <section>
          <h2>Performance Dashboard Demo</h2>
          {/* 
            In a real app, studentId would come from the authenticated user's context.
            For demo purposes, we pass a hardcoded studentId.
            The student created during registration or a placeholder student_user_id used in exam submission (e.g., 1)
            should have some attempts if you've run through the exam submission flow.
          */}
          <PerformanceDashboardPage studentId={1} />
        </section>
        <hr />
        <section>
          <h2>Parent Registration Demo</h2>
          <ParentRegisterPage />
        </section>
        <hr />
        <section>
          <h2>Parent Login Demo</h2>
          <ParentLoginPage />
        </section>
        <hr />
        <section>
          <h2>Parent Dashboard Demo</h2>
          {/* 
            In a real app, parentId would come from the authenticated user's context.
            For demo purposes, we pass a hardcoded parentId.
            A parent user needs to be created first (e.g., ID 2 if ID 1 is a student).
            You might need to register a parent manually or via the ParentRegisterPage,
            then find their user_id in the 'users' table (where role='parent')
            and use that ID here. Let's assume parent with user_id=2 exists.
          */}
          <ParentDashboardPage parentId={2} /> 
        </section>
        <hr />
        <section>
          <h2>Admin Dashboard Demo</h2>
          {/* 
            The AdminDashboardPage itself checks if the logged-in user (from localStorage) is an admin.
            Ensure an admin user (e.g. admin@igcseplatform.com / AdminPassword123!) is logged in
            via the general login page for this to display correctly.
          */}
          <AdminDashboardPage />
        </section>
      </main>
    </div>
  );
}

export default App;
