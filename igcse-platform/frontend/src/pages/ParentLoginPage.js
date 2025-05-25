import React, { useState } from 'react';
import { loginUser } from '../services/authService'; // Re-using for now

// NOTE: loginUser currently might not differentiate roles on the frontend side
// or handle redirection specific to parents. For this task, login is generic.

const ParentLoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    // const history = useHistory(); // For redirection to parent dashboard

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            return;
        }

        try {
            const response = await loginUser(formData); // Generic login
            setMessage(response.message || "Parent login successful!");
            // Store token if received (e.g., in localStorage)
            // if (response.access_token && response.role === 'parent') { // Check role
            //     localStorage.setItem('userToken', response.access_token);
            //     localStorage.setItem('userRole', response.role); // Store role
            //     // history.push('/parent-dashboard'); // Redirect
            // } else if(response.role !== 'parent') {
            //     setError("Login successful, but you are not a parent user.");
            //     // Clear token if set by generic login
            // }
            setFormData({ email: '', password: '' });
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error("Parent login error:", err);
        }
    };

    return (
        <div>
            <h2>Parent Login</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login as Parent</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ParentLoginPage;
