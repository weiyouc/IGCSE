import React, { useState, useEffect, useCallback } from 'react';
import { createTask, listTasks, updateTask, deleteTask } from '../../services/studyTaskService';

const StudyTaskManager = ({ studentId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState({
        description: '', estimated_duration_minutes: '', due_date: ''
    });

    const [editingTask, setEditingTask] = useState(null); // Task object or null
    const [editFormData, setEditFormData] = useState({
        description: '', estimated_duration_minutes: '', due_date: '', status: ''
    });

    const currentStudentId = studentId || parseInt(localStorage.getItem('loggedInUserId')); // Use prop or fallback

    const loadTasks = useCallback(async () => {
        if (!currentStudentId) {
            setError("Student ID not available for loading tasks.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await listTasks(currentStudentId);
            setTasks(data);
        } catch (err) {
            setError(err.message || "Failed to fetch tasks.");
        } finally {
            setLoading(false);
        }
    }, [currentStudentId]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleCreateInputChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError('');
        if (!newTask.description) {
            setError("Description is required for new task.");
            return;
        }
        try {
            setLoading(true);
            await createTask(currentStudentId, {
                ...newTask,
                estimated_duration_minutes: newTask.estimated_duration_minutes ? parseInt(newTask.estimated_duration_minutes) : null,
            });
            setNewTask({ description: '', estimated_duration_minutes: '', due_date: '' });
            setShowCreateForm(false);
            loadTasks();
        } catch (err) {
            setError(err.message || "Failed to create task.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!editingTask) return;
        setError('');
        try {
            setLoading(true);
            await updateTask(currentStudentId, editingTask.task_id, {
                ...editFormData,
                estimated_duration_minutes: editFormData.estimated_duration_minutes ? parseInt(editFormData.estimated_duration_minutes) : null,
            });
            setEditingTask(null);
            loadTasks();
        } catch (err) {
            setError(err.message || `Failed to update task ${editingTask.task_id}.`);
        } finally {
            setLoading(false);
        }
    };
    
    const quickUpdateStatus = async (task, newStatus) => {
        setError('');
        try {
            setLoading(true); // Could set a specific task's loading state
            await updateTask(currentStudentId, task.task_id, { status: newStatus });
            loadTasks(); // Refresh all tasks
        } catch (err) {
             setError(err.message || `Failed to update status for task ${task.task_id}.`);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteTask = async (taskId) => {
        setError('');
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            setLoading(true);
            await deleteTask(currentStudentId, taskId);
            loadTasks();
        } catch (err) {
            setError(err.message || `Failed to delete task ${taskId}.`);
        } finally {
            setLoading(false);
        }
    };

    const openEditForm = (task) => {
        setEditingTask(task);
        setEditFormData({
            description: task.description,
            estimated_duration_minutes: task.estimated_duration_minutes || '',
            due_date: task.due_date || '',
            status: task.status
        });
    };

    if (!currentStudentId) {
         return <p style={{ color: 'red' }}>Error: Student ID not found. Please ensure you are logged in as a student.</p>;
    }
    if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
    
    return (
        <div style={{ padding: '20px' }}>
            <h3>My Study Tasks</h3>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginBottom: '15px', padding: '10px' }}>
                {showCreateForm ? 'Cancel New Task' : '+ Add New Task'}
            </button>

            {showCreateForm && (
                <form onSubmit={handleCreateTask} style={formStyle}>
                    <h4>Create New Task</h4>
                    <textarea name="description" value={newTask.description} onChange={handleCreateInputChange} placeholder="Task Description (e.g., Review Chapter 5 Physics)" required rows="3" style={{width: '100%', padding:'8px'}}/>
                    <input name="estimated_duration_minutes" type="number" value={newTask.estimated_duration_minutes} onChange={handleCreateInputChange} placeholder="Est. Duration (mins)" />
                    <input name="due_date" type="date" value={newTask.due_date} onChange={handleCreateInputChange} />
                    <button type="submit" disabled={loading} style={{padding: '8px 15px'}}>Create Task</button>
                </form>
            )}

            {editingTask && (
                <form onSubmit={handleUpdateTask} style={formStyle}>
                    <h4>Edit Task (ID: {editingTask.task_id})</h4>
                    <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} placeholder="Task Description" required rows="3" style={{width: '100%', padding:'8px'}}/>
                    <input name="estimated_duration_minutes" type="number" value={editFormData.estimated_duration_minutes} onChange={handleEditInputChange} placeholder="Est. Duration (mins)" />
                    <input name="due_date" type="date" value={editFormData.due_date} onChange={handleEditInputChange} />
                    <select name="status" value={editFormData.status} onChange={handleEditInputChange}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button type="submit" disabled={loading} style={{padding: '8px 15px'}}>Update Task</button>
                        <button type="button" onClick={() => setEditingTask(null)} disabled={loading} style={{padding: '8px 15px'}}>Cancel</button>
                    </div>
                </form>
            )}
            
            {tasks.length === 0 && !loading && <p>No tasks found. Add some to get started!</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {tasks.map(task => (
                    <div key={task.task_id} style={taskCardStyle(task.status)}>
                        <h4>{task.description}</h4>
                        <p>Status: <strong>{task.status}</strong></p>
                        {task.due_date && <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                        {task.estimated_duration_minutes && <p>Est. Time: {task.estimated_duration_minutes} mins</p>}
                        <p><small>Created: {new Date(task.created_at).toLocaleDateString()}</small></p>
                        
                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {task.status !== 'completed' && 
                                <button onClick={() => quickUpdateStatus(task, 'completed')} style={buttonStyle}>Mark Complete</button>}
                            {task.status === 'pending' && 
                                <button onClick={() => quickUpdateStatus(task, 'in_progress')} style={buttonStyle}>Start Task</button>}
                            {task.status === 'in_progress' && 
                                <button onClick={() => quickUpdateStatus(task, 'pending')} style={buttonStyle}>Mark Pending</button>}
                            <button onClick={() => openEditForm(task)} style={buttonStyle}>Edit</button>
                            <button onClick={() => handleDeleteTask(task.task_id)} style={{...buttonStyle, backgroundColor: '#f44336'}}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles
const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '10px', 
    padding: '20px', border: '1px solid #ccc', borderRadius: '8px', 
    marginBottom: '20px', maxWidth: '500px', backgroundColor: '#f9f9f9'
};

const taskCardStyle = (status) => ({
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    minWidth: '250px',
    maxWidth: '300px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: status === 'completed' ? '#e8f5e9' : (status === 'in_progress' ? '#e3f2fd' : 'white'),
    opacity: status === 'completed' ? 0.8 : 1,
});

const buttonStyle = {
    padding: '6px 10px', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontSize: '0.9em',
    backgroundColor: '#607d8b', // A neutral button color
    color: 'white'
};


export default StudyTaskManager;
