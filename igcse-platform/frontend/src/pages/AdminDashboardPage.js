import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsSummary from '../components/admin/AnalyticsSummary'; // Import AnalyticsSummary

// Placeholder for checking if user is admin.
// In a real app, this would come from auth context or similar.
const isAdminUser = () => {
    const role = localStorage.getItem('loggedInUserRole');
    return role === 'admin';
};

const AdminDashboardPage = () => {
    // Check if the user is actually an admin. Redirect if not.
    // This is a client-side check; server-side is the primary protection.
    if (!isAdminUser()) {
        // In a real app with React Router, you'd use <Redirect /> or navigate().
        // For now, just showing a message.
        return (
            <div>
                <p>Access Denied. You must be an admin to view this page.</p>
                <p>Please log in as an admin.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome, Admin! Manage your platform users and settings here.</p>

            <section style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <AnalyticsSummary />
            </section>
            
            <section style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <UserManagement />
            </section>

            {/* Other admin sections can be added here later */}
            {/* 
            <section style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Content Management (Placeholder)</h3>
                <p>Manage subjects, exams, questions, etc.</p>
            </section>
            <section style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Platform Analytics (Placeholder)</h3>
                <p>View usage statistics, performance metrics, etc.</p>
            </section>
            */}
        </div>
    );
};

export default AdminDashboardPage;
