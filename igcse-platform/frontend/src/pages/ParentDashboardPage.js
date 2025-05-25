import React, { useState, useEffect, useCallback } from 'react';
import { linkStudentToParent, fetchLinkedStudents } from '../services/parentService';
import { fetchStudentAttempts } from '../services/studentService'; // To show performance for a selected student

const ParentDashboardPage = ({ parentId }) => { // parentId from props or auth context
    const [studentIdentifier, setStudentIdentifier] = useState('');
    const [linkMessage, setLinkMessage] = useState('');
    const [linkError, setLinkError] = useState('');
    const [linkedStudents, setLinkedStudents] = useState([]);
    const [loadingLinkedStudents, setLoadingLinkedStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAttempts, setStudentAttempts] = useState([]);
    const [loadingAttempts, setLoadingAttempts] = useState(false);

    // For demo: If parentId is not passed, use a default.
    // In a real app, parentId would come from auth context after login.
    const currentParentId = parentId || 1; // Assuming parent with user_id 1 exists.

    const loadLinkedStudents = useCallback(async () => {
        if (!currentParentId) return;
        try {
            setLoadingLinkedStudents(true);
            setLinkError(''); // Clear previous errors
            const students = await fetchLinkedStudents(currentParentId);
            setLinkedStudents(students);
        } catch (err) {
            setLinkError(err.message || "Failed to load linked students.");
        } finally {
            setLoadingLinkedStudents(false);
        }
    }, [currentParentId]);

    useEffect(() => {
        loadLinkedStudents();
    }, [loadLinkedStudents]);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        if (!studentIdentifier.trim()) {
            setLinkError("Please enter a student's email to link.");
            return;
        }
        setLinkMessage('');
        setLinkError('');
        try {
            const response = await linkStudentToParent({
                parent_id: currentParentId, // This would come from auth in a real app
                student_identifier: studentIdentifier,
            });
            setLinkMessage(response.message || "Link request processed.");
            setStudentIdentifier(''); // Clear input
            loadLinkedStudents(); // Refresh the list of linked students
        } catch (err) {
            setLinkError(err.message || "Failed to link student.");
        }
    };

    const handleViewStudentPerformance = async (student) => {
        setSelectedStudent(student);
        setStudentAttempts([]); // Clear previous attempts
        if (!student || !student.user_id) return;
        try {
            setLoadingAttempts(true);
            const attempts = await fetchStudentAttempts(student.user_id);
            setStudentAttempts(attempts);
        } catch (err) {
            console.error("Error fetching student attempts:", err);
            // Optionally set an error state for attempts
        } finally {
            setLoadingAttempts(false);
        }
    };


    return (
        <div>
            <h2>Parent Dashboard</h2>
            <p>Welcome, Parent ID: {currentParentId}</p> {/* Display parent ID for demo */}

            <section style={sectionStyle}>
                <h3>Link New Student</h3>
                <form onSubmit={handleLinkStudent}>
                    <div>
                        <label htmlFor="student_identifier">Student's Email:</label>
                        <input
                            type="email"
                            id="student_identifier"
                            value={studentIdentifier}
                            onChange={(e) => setStudentIdentifier(e.target.value)}
                            placeholder="student@example.com"
                            required
                            style={{ marginLeft: '10px', padding: '8px', width: '250px' }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: '10px', padding: '10px 15px' }}>
                        Link Student
                    </button>
                </form>
                {linkMessage && <p style={{ color: 'green' }}>{linkMessage}</p>}
                {linkError && <p style={{ color: 'red' }}>{linkError}</p>}
            </section>

            <section style={sectionStyle}>
                <h3>Linked Students</h3>
                {loadingLinkedStudents && <p>Loading linked students...</p>}
                {linkedStudents.length === 0 && !loadingLinkedStudents && (
                    <p>No students are currently linked to your account.</p>
                )}
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {linkedStudents.map(student => (
                        <li key={student.user_id} style={listItemStyle}>
                            <span>{student.first_name} {student.last_name} ({student.email})</span>
                            <button 
                                onClick={() => handleViewStudentPerformance(student)}
                                style={{ marginLeft: '15px', padding: '5px 10px' }}
                            >
                                View Performance
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
            
            {selectedStudent && (
                <section style={sectionStyle}>
                    <h3>Performance for {selectedStudent.first_name} {selectedStudent.last_name}</h3>
                    {loadingAttempts && <p>Loading attempts...</p>}
                    {studentAttempts.length === 0 && !loadingAttempts && <p>No attempts found for this student.</p>}
                    {studentAttempts.length > 0 && (
                         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Exam Title</th>
                                    <th style={tableHeaderStyle}>Date Attempted</th>
                                    <th style={tableHeaderStyle}>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentAttempts.map(attempt => (
                                    <tr key={attempt.attempt_id}>
                                        <td style={tableCellStyle}>{attempt.exam_title}</td>
                                        <td style={tableCellStyle}>
                                            {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={tableCellStyle}>{attempt.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                     <button onClick={() => setSelectedStudent(null)} style={{ marginTop: '10px' }}>
                        Close Performance View
                    </button>
                </section>
            )}
        </div>
    );
};

// Basic styling
const sectionStyle = {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
};

const listItemStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const tableHeaderStyle = {
    borderBottom: '2px solid #ddd',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f7f7f7',
};

const tableCellStyle = {
    borderBottom: '1px solid #eee',
    padding: '10px',
    textAlign: 'left',
};


export default ParentDashboardPage;
