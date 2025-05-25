import React, { useState, useEffect, useCallback } from 'react';
import { fetchExamDetails, submitExamAttempt } from '../services/examService'; // Adjust path as necessary
// import { useHistory, useParams } from 'react-router-dom'; // If using React Router

const ExamPage = ({ examIdFromProps }) => { // examId can come from props or URL
    // const { examId: examIdFromUrl } = useParams(); // Example if using React Router
    // const history = useHistory(); // Example if using React Router
    
    const examId = examIdFromProps || 1; // Fallback or get from URL. Using 1 for demo.

    const [examDetails, setExamDetails] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null); // in seconds
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [submissionError, setSubmissionError] = useState('');

    // Fetch exam details
    useEffect(() => {
        const loadExam = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchExamDetails(examId);
                setExamDetails(data);
                if (data.duration_minutes) {
                    setTimeLeft(data.duration_minutes * 60);
                }
            } catch (err) {
                setError(err.message || "Failed to load exam details.");
                console.error("Exam loading error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (examId) {
            loadExam();
        }
    }, [examId]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleSubmit = useCallback(async () => {
        if (!examDetails) return;

        setSubmissionMessage('');
        setSubmissionError('');

        // In a real app, student_user_id would come from auth context or similar
        const studentUserId = 1; // Placeholder student ID

        const submissionData = {
            student_user_id: studentUserId,
            exam_id: examDetails.exam_id,
            answers: answers,
            time_taken_seconds: (examDetails.duration_minutes * 60) - (timeLeft || 0),
        };

        try {
            const response = await submitExamAttempt(submissionData);
            setSubmissionMessage(response.message || "Exam submitted successfully!");
            // history.push('/dashboard'); // Redirect to a dashboard or results page
            if (timeLeft > 0) setTimeLeft(0); // Stop timer
        } catch (err) {
            setSubmissionError(err.message || "Exam submission failed.");
            console.error("Submission error:", err);
        }
    }, [examDetails, answers, timeLeft]);


    // Timer effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submissionMessage) {
            if (timeLeft === 0 && !submissionMessage && examDetails) { // Auto-submit if timer reaches 0
                handleSubmit();
            }
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId); // Cleanup interval on component unmount or when timeLeft changes
    }, [timeLeft, submissionMessage, handleSubmit, examDetails]);


    if (loading) return <p>Loading exam...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (!examDetails) return <p>No exam details found.</p>;

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div>
            <h2>{examDetails.title}</h2>
            {timeLeft !== null && !submissionMessage && (
                <p style={{ fontSize: '1.2em', color: timeLeft <= 60 ? 'red' : 'black' }}>
                    Time Left: {formatTime(timeLeft)}
                </p>
            )}

            {submissionMessage && <p style={{ color: 'green' }}>{submissionMessage}</p>}
            {submissionError && <p style={{ color: 'red' }}>{submissionError}</p>}

            {!submissionMessage && (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    {(examDetails.questions || []).map(question => (
                        <div key={question.id} style={{ marginBottom: '20px' }}>
                            <p><strong>{question.id}:</strong> {question.text}</p>
                            <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                style={{ width: '80%', padding: '8px', marginTop: '5px' }}
                                disabled={submissionMessage !== ''}
                            />
                        </div>
                    ))}
                    <button type="submit" disabled={submissionMessage !== ''}>
                        Submit Exam
                    </button>
                </form>
            )}
        </div>
    );
};

export default ExamPage;
