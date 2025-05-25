import React, { useState } from 'react';
import { registerStudent } from '../services/authService'; // Re-using for now, ideally rename or create parentAuthService

// NOTE: We are re-using `registerStudent` from `authService` which calls `/auth/register/student`.
// For parent registration, we need a new service function that calls `/auth/register/parent`.
// For this task, let's assume `authService.js` is updated or a new service is made.
// For now, this will hit the wrong endpoint if `authService.registerStudent` is not generic enough or updated.
// Let's simulate a call to a hypothetical `registerParent` service function.

// Simulated/placeholder service function for parent registration
const registerParentService = async (parentData) => {
    // This would typically be in authService.js or a new parentAuthService.js
    const response = await fetch('http://localhost:5000/auth/register/parent', { // Corrected endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};


const ParentRegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            setError("All fields are required.");
            return;
        }

        try {
            // const response = await registerStudent(formData); // Original call
            const response = await registerParentService(formData); // Call to hypothetical/updated service
            setMessage(response.message || "Parent registration successful!");
            setFormData({ email: '', password: '', first_name: '', last_name: '' });
        } catch (err) {
            setError(err.message || "Parent registration failed. Please try again.");
            console.error("Parent registration error:", err);
        }
    };

    return (
        <div>
            <h2>Parent Registration</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="first_name">First Name:</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="last_name">Last Name:</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Register as Parent</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ParentRegisterPage;
