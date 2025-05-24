import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, createUser, updateUser } from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '', password: '', first_name: '', last_name: '', role: 'STUDENT'
    });

    const [editingUser, setEditingUser] = useState(null); // User object or null
    const [editFormData, setEditFormData] = useState({
        email: '', first_name: '', last_name: '', password: '' // Password optional on update
    });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleCreateInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name || !newUser.role) {
            setError("All fields are required for new user.");
            return;
        }
        try {
            setLoading(true);
            await createUser(newUser);
            setNewUser({ email: '', password: '', first_name: '', last_name: '', role: 'STUDENT' });
            setShowCreateForm(false);
            loadUsers(); // Refresh user list
        } catch (err) {
            setError(err.message || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setError('');
        // Prepare data for update (only send non-empty fields or changed fields)
        const updateData = { ...editFormData };
        if (!updateData.password) { // Don't send empty password
            delete updateData.password;
        }

        try {
            setLoading(true);
            await updateUser(editingUser.user_id, updateData);
            setEditingUser(null); // Close edit form
            loadUsers(); // Refresh user list
        } catch (err) {
            setError(err.message || `Failed to update user ${editingUser.user_id}.`);
        } finally {
            setLoading(false);
        }
    };

    const openEditForm = (user) => {
        setEditingUser(user);
        setEditFormData({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: '' // Clear password field for updates
        });
    };

    if (loading && users.length === 0) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div>
            <h3>User Management</h3>
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginBottom: '15px' }}>
                {showCreateForm ? 'Cancel Create User' : 'Create New User'}
            </button>

            {showCreateForm && (
                <form onSubmit={handleCreateUser} style={formStyle}>
                    <h4>Create New User</h4>
                    <input name="first_name" value={newUser.first_name} onChange={handleCreateInputChange} placeholder="First Name" required />
                    <input name="last_name" value={newUser.last_name} onChange={handleCreateInputChange} placeholder="Last Name" required />
                    <input name="email" type="email" value={newUser.email} onChange={handleCreateInputChange} placeholder="Email" required />
                    <input name="password" type="password" value={newUser.password} onChange={handleCreateInputChange} placeholder="Password" required />
                    <select name="role" value={newUser.role} onChange={handleCreateInputChange}>
                        <option value="STUDENT">Student</option>
                        <option value="PARENT">Parent</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" disabled={loading}>Create User</button>
                </form>
            )}

            {editingUser && (
                <form onSubmit={handleUpdateUser} style={formStyle}>
                    <h4>Edit User: {editingUser.email} (ID: {editingUser.user_id})</h4>
                    <input name="first_name" value={editFormData.first_name} onChange={handleEditInputChange} placeholder="First Name" required />
                    <input name="last_name" value={editFormData.last_name} onChange={handleEditInputChange} placeholder="Last Name" required />
                    <input name="email" type="email" value={editFormData.email} onChange={handleEditInputChange} placeholder="Email" required />
                    <input name="password" type="password" value={editFormData.password} onChange={handleEditInputChange} placeholder="New Password (optional)" />
                    <p>Role: {editingUser.role} (Role changes not supported in this form)</p>
                    <button type="submit" disabled={loading}>Update User</button>
                    <button type="button" onClick={() => setEditingUser(null)} disabled={loading}>Cancel</button>
                </form>
            )}
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Name</th>
                        <th style={tableHeaderStyle}>Role</th>
                        <th style={tableHeaderStyle}>Created At</th>
                        <th style={tableHeaderStyle}>Details</th>
                        <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_id}>
                            <td style={tableCellStyle}>{user.user_id}</td>
                            <td style={tableCellStyle}>{user.email}</td>
                            <td style={tableCellStyle}>{user.first_name} {user.last_name}</td>
                            <td style={tableCellStyle}>{user.role}</td>
                            <td style={tableCellStyle}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td style={tableCellStyle}>
                                {user.role === 'PARENT' && `Linked: ${user.role_specific_details?.linked_students_count || 0}`}
                                {/* Add other role-specific details here if needed */}
                            </td>
                            <td style={tableCellStyle}>
                                <button onClick={() => openEditForm(user)}>Edit</button>
                                {/* Delete/Deactivate button can be added here */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Basic styling (can be moved to CSS files)
const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '10px', 
    padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px', maxWidth: '400px'
};
const tableHeaderStyle = { borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#f7f7f7' };
const tableCellStyle = { borderBottom: '1px solid #eee', padding: '10px', textAlign: 'left' };

export default UserManagement;
