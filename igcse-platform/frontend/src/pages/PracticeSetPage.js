import React, { useState } from 'react';
// Assuming generatePracticeSet will be called by a parent component or a button on another page
// This component will receive the practice set data as a prop.

const PracticeSetPage = ({ practiceSetData, studentName }) => {
    const [answers, setAnswers] = useState({});
    const [showAnswers, setShowAnswers] = useState(false);

    if (!practiceSetData || !practiceSetData.questions || practiceSetData.questions.length === 0) {
        return <p>No practice questions available, or practice set is empty.</p>;
    }

    const { title, questions, suggested_duration_minutes } = practiceSetData;

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleShowAnswers = () => {
        setShowAnswers(true);
    };

    const handleRetake = () => {
        setShowAnswers(false);
        setAnswers({});
    }

    return (
        <div>
            <h2>{title || `Practice Set for ${studentName || 'Student'}`}</h2>
            {suggested_duration_minutes && <p>Suggested time: {suggested_duration_minutes} minutes</p>}
            <p>This practice set is based on questions you previously found challenging. Review them carefully.</p>

            {questions.map(question => (
                <div key={question.id + (question.error_log_id || '')} style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    border: '1px solid #eee',
                    backgroundColor: showAnswers && (answers[question.id]?.toLowerCase() === question.answer.toLowerCase() ? '#e6ffed' : '#ffe6e6')
                }}>
                    <p><strong>Question ID: {question.id}</strong> (From Exam: {question.original_exam_id})</p>
                    <p>{question.text}</p>
                    {!showAnswers && (
                        <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            style={{ width: '80%', padding: '8px', marginTop: '5px' }}
                        />
                    )}
                    {showAnswers && (
                        <div>
                            <p style={{ color: 'grey' }}>Your answer: {answers[question.id] || 'Not answered'}</p>
                            <p style={{ color: 'green' }}>Correct answer: {question.answer}</p>
                        </div>
                    )}
                </div>
            ))}

            {!showAnswers && (
                <button onClick={handleShowAnswers} style={{ marginRight: '10px', padding: '10px 15px' }}>
                    View Answers
                </button>
            )}
            {showAnswers && (
                 <button onClick={handleRetake} style={{ marginRight: '10px', padding: '10px 15px' }}>
                    Retake / Hide Answers
                </button>
            )}
        </div>
    );
};

export default PracticeSetPage;
