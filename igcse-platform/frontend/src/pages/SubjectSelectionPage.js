import React, { useState, useEffect } from 'react';
import { fetchSubjects } from '../services/subjectService'; // Adjust path as necessary

const SubjectSelectionPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchSubjects();
                setSubjects(data);
            } catch (err) {
                setError(err.message || "Failed to load subjects. Please try again later.");
                console.error("Subject loading error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, []); // Empty dependency array means this effect runs once on component mount

    if (loading) {
        return <p>Loading subjects...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (subjects.length === 0) {
        return <p>No subjects available at the moment.</p>;
    }

    return (
        <div>
            <h2>Select Your Subjects</h2>
            <p>Here are the available IGCSE subjects. You'll be able to customize your preferences later.</p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {subjects.map(subject => (
                    <li key={subject.subject_id} style={{ 
                        border: '1px solid #ddd', 
                        margin: '10px', 
                        padding: '15px',
                        borderRadius: '5px',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <h3>{subject.name}</h3>
                        {subject.igcse_code && <p>IGCSE Code: {subject.igcse_code}</p>}
                        {/* Later, add a button or checkbox for selection */}
                        {/* <button onClick={() => handleSelectSubject(subject.subject_id)}>Select</button> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubjectSelectionPage;
