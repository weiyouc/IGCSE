import React, { useState, useEffect } from 'react';
import { fetchAnalyticsSummary } from '../../services/adminService';

const AnalyticsSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSummary = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchAnalyticsSummary();
                setSummary(data);
            } catch (err) {
                setError(err.message || "Failed to fetch analytics summary.");
            } finally {
                setLoading(false);
            }
        };
        loadSummary();
    }, []);

    if (loading) return <p>Loading analytics summary...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (!summary) return <p>No analytics data available.</p>;

    const cardStyle = {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        margin: '10px',
        minWidth: '200px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
    };

    const containerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px', // For spacing between cards if they wrap
        justifyContent: 'flex-start', // Or 'space-around'
        marginBottom: '20px'
    };
    
    const valueStyle = {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 10px 0',
    };

    const labelStyle = {
        fontSize: '1em',
        color: '#666',
    };

    return (
        <div>
            <h3>Platform Analytics Summary</h3>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <p style={valueStyle}>{summary.total_students !== undefined ? summary.total_students : 'N/A'}</p>
                    <p style={labelStyle}>Total Students</p>
                </div>
                <div style={cardStyle}>
                    <p style={valueStyle}>{summary.total_parents !== undefined ? summary.total_parents : 'N/A'}</p>
                    <p style={labelStyle}>Total Parents</p>
                </div>
                <div style={cardStyle}>
                    <p style={valueStyle}>{summary.total_admins !== undefined ? summary.total_admins : 'N/A'}</p>
                    <p style={labelStyle}>Total Admins</p>
                </div>
                <div style={cardStyle}>
                    <p style={valueStyle}>{summary.total_exam_attempts !== undefined ? summary.total_exam_attempts : 'N/A'}</p>
                    <p style={labelStyle}>Total Exam Attempts</p>
                </div>
                <div style={cardStyle}>
                    <p style={valueStyle}>{summary.total_errors_logged !== undefined ? summary.total_errors_logged : 'N/A'}</p>
                    <p style={labelStyle}>Total Errors Logged</p>
                </div>
                {summary.new_users_today !== undefined && (
                    <div style={cardStyle}>
                        <p style={valueStyle}>{summary.new_users_today}</p>
                        <p style={labelStyle}>New Users Today</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsSummary;
