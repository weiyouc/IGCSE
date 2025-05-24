import React, { useState, useEffect } from 'react';
import { fetchStudentAttempts } from '../services/studentService';
import { generatePracticeSet } from '../services/practiceService';
import PracticeSetPage from './PracticeSetPage';
import StudyTaskManager from '../components/student/StudyTaskManager';
import StudySessionManager from '../components/student/StudySessionManager'; // Import StudySessionManager

const PerformanceDashboardPage = ({ studentId }) => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [practiceSet, setPracticeSet] = useState(null);
    const [loadingPracticeSet, setLoadingPracticeSet] = useState(false);
    const [practiceSetError, setPracticeSetError] = useState('');

    const currentStudentId = studentId || 1; // Fallback for demo

    useEffect(() => {
        if (!currentStudentId) {
            setError("No student ID provided.");
            setLoading(false);
            return;
        }
        const loadAttempts = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchStudentAttempts(currentStudentId);
                setAttempts(data);
            } catch (err) {
                setError(err.message || "Failed to load exam attempts.");
            } finally {
                setLoading(false);
            }
        };
        loadAttempts();
    }, [currentStudentId]);

    const handleGeneratePracticeSet = async () => {
        if (!currentStudentId) {
            setPracticeSetError("Student ID is missing.");
            return;
        }
        try {
            setLoadingPracticeSet(true);
            setPracticeSetError('');
            setPracticeSet(null); // Clear previous set
            const data = await generatePracticeSet(currentStudentId);
            if (data && data.questions && data.questions.length > 0) {
                setPracticeSet(data);
            } else {
                setPracticeSetError(data.message || "No questions available for practice set.");
            }
        } catch (err) {
            setPracticeSetError(err.message || "Failed to generate practice set.");
        } finally {
            setLoadingPracticeSet(false);
        }
    };

    if (loading) return <p>Loading performance data...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    // If a practice set is generated, show it. Otherwise, show the dashboard.
    if (practiceSet) {
        return (
            <div style={{padding: '20px'}}>
                <button onClick={() => setPracticeSet(null)} style={{ marginBottom: '20px', padding: '10px 15px' }}>
                    Back to Dashboard
                </button>
                <PracticeSetPage practiceSetData={practiceSet} studentName={`Student ${currentStudentId}`} />
            </div>
        );
    }

    return (
        <div style={{padding: '20px'}}>
            <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Student Dashboard</h2>
            
            {/* Section for Study Session Manager */}
            <section style={dashboardSectionStyle}>
                <StudySessionManager studentId={currentStudentId} />
            </section>

            {/* Section for Study Task Manager */}
            <section style={dashboardSectionStyle}>
                <StudyTaskManager studentId={currentStudentId} />
            </section>

            {/* Section for Performance and Practice Set */}
            <section style={dashboardSectionStyle}>
                <h3>My Exam Performance</h3>
                <button 
                    onClick={handleGeneratePracticeSet} 
                    disabled={loadingPracticeSet}
                    style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {loadingPracticeSet ? 'Generating...' : 'Generate Personalized Practice Set'}
                </button>
                {practiceSetError && <p style={{ color: 'red' }}>{practiceSetError}</p>}

                {attempts.length === 0 && !loadingPracticeSet && (
                    <p>No exam attempts found for this student.</p>
                )}

                {attempts.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeaderStyle}>Exam Title</th>
                                <th style={tableHeaderStyle}>Date Attempted</th>
                                <th style={tableHeaderStyle}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map(attempt => (
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
            </section>
        </div>
    );
};

const dashboardSectionStyle = {
    marginBottom: '40px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

// Basic styling for the table (can be moved to a CSS file)
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

export default PerformanceDashboardPage;
