import React, { useState } from 'react';
import { loginUser } from '../services/authService'; // Assuming authService.js is in ../services
// import { useHistory } from 'react-router-dom'; // For redirection, if you have routing setup

const StudentLoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    // const history = useHistory(); // For redirection. In a real app, use React Router's useHistory or useNavigate.

    // Placeholder for a global auth context or state management
    const { setCurrentUser } = (window.authContext || { setCurrentUser: () => {} }); // Simulated context

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
            const response = await loginUser(formData);
            setMessage(response.message || "Login successful!");
            
            // Store token and user info (simplified)
            // In a real app, this would be handled more robustly (e.g., JWT in localStorage/sessionStorage)
            // and user role/details might be stored in a global context.
            if (response.user_id && response.role) {
                localStorage.setItem('loggedInUserId', response.user_id); // For demo purposes
                localStorage.setItem('loggedInUserRole', response.role); // For demo purposes
                
                // Simulate setting user in context
                setCurrentUser({ id: response.user_id, email: response.email, role: response.role });

                // Role-based redirection (conceptual)
                if (response.role === 'admin') {
                    setMessage(response.message + " Redirecting to Admin Dashboard...");
                    console.log("Redirecting to Admin Dashboard (not implemented in this snippet)");
                    // history.push('/admin-dashboard'); // Example redirect for Admin
                } else if (response.role === 'parent') {
                    setMessage(response.message + " Redirecting to Parent Dashboard...");
                    console.log("Redirecting to Parent Dashboard (not implemented in this snippet)");
                    // history.push('/parent-dashboard'); // Example redirect for Parent
                } else { // Student or default
                    setMessage(response.message + " Redirecting to Student Dashboard...");
                    console.log("Redirecting to Student Dashboard (not implemented in this snippet)");
                    // history.push('/student-dashboard'); // Example redirect for Student
                }
            }
            setFormData({ email: '', password: '' });
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            localStorage.removeItem('loggedInUserId'); // Clear on error
            localStorage.removeItem('loggedInUserRole'); // Clear on error
            console.error("Login error:", err);
        }
    };

    return (
        <div>
            <h2>Student Login</h2>
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
                <button type="submit">Login</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default StudentLoginPage;
