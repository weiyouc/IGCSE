import React, { useState, useEffect, useCallback } from 'react';
import { 
    createStudySession, listStudySessions, getStudySessionDetails, 
    startStudySession, endStudySession, updatePlannedStudySession 
} from '../../services/studySessionService';
import { listTasks as fetchStudentTasks } from '../../services/studyTaskService'; // To select tasks

const StudySessionManager = ({ studentId }) => {
    const [sessions, setSessions] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showPlanForm, setShowPlanForm] = useState(false);
    const [newSession, setNewSession] = useState({
        title: '', planned_duration_minutes: '', linked_task_ids: []
    });

    const [activeSession, setActiveSession] = useState(null); // Full session details
    const [activeSessionTimer, setActiveSessionTimer] = useState(0); // in seconds
    const [timerIntervalId, setTimerIntervalId] = useState(null);

    const currentStudentId = studentId || parseInt(localStorage.getItem('loggedInUserId'));

    const loadSessions = useCallback(async () => {
        if (!currentStudentId) {
            setError("Student ID missing for loading sessions.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await listStudySessions(currentStudentId);
            setSessions(data);
        } catch (err) {
            setError(err.message || "Failed to fetch study sessions.");
        } finally {
            setLoading(false);
        }
    }, [currentStudentId]);

    const loadAvailableTasks = useCallback(async () => {
        if (!currentStudentId) return;
        try {
            // Fetch only pending or in_progress tasks to link to new sessions
            const tasks = await fetchStudentTasks(currentStudentId);
            setAvailableTasks(tasks.filter(task => task.status !== 'completed'));
        } catch (err) {
            console.error("Failed to fetch available tasks:", err);
            // Handle error for available tasks separately if needed
        }
    }, [currentStudentId]);

    useEffect(() => {
        loadSessions();
        loadAvailableTasks();
    }, [loadSessions, loadAvailableTasks]);

    // Active Session Timer Logic
    useEffect(() => {
        if (activeSession && activeSession.status === 'active' && activeSession.start_time) {
            const startTime = new Date(activeSession.start_time).getTime();
            
            const updateTimer = () => {
                const now = new Date().getTime();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                setActiveSessionTimer(elapsedSeconds);
            };
            updateTimer(); // Initial set
            const intervalId = setInterval(updateTimer, 1000);
            setTimerIntervalId(intervalId);
            return () => clearInterval(intervalId);
        } else if (timerIntervalId) {
            clearInterval(timerIntervalId);
            setTimerIntervalId(null);
        }
    }, [activeSession]);


    const handlePlanInputChange = (e) => {
        const { name, value } = e.target;
        setNewSession({ ...newSession, [name]: value });
    };

    const handleTaskSelectionChange = (taskId) => {
        const selectedIds = newSession.linked_task_ids;
        if (selectedIds.includes(taskId)) {
            setNewSession({ ...newSession, linked_task_ids: selectedIds.filter(id => id !== taskId) });
        } else {
            setNewSession({ ...newSession, linked_task_ids: [...selectedIds, taskId] });
        }
    };

    const handlePlanSession = async (e) => {
        e.preventDefault();
        setError('');
        if (!newSession.title && newSession.linked_task_ids.length === 0) {
            setError("Session title or at least one linked task is required.");
            return;
        }
        try {
            setLoading(true);
            await createStudySession(currentStudentId, {
                ...newSession,
                planned_duration_minutes: newSession.planned_duration_minutes ? parseInt(newSession.planned_duration_minutes) : null,
            });
            setNewSession({ title: '', planned_duration_minutes: '', linked_task_ids: [] });
            setShowPlanForm(false);
            loadSessions();
            loadAvailableTasks(); // Refresh tasks as some might be linked
        } catch (err) {
            setError(err.message || "Failed to plan session.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = async (sessionId) => {
        setError('');
        try {
            setLoading(true);
            await startStudySession(currentStudentId, sessionId);
            const details = await getStudySessionDetails(currentStudentId, sessionId); // Fetch full details for active view
            setActiveSession(details);
            loadSessions(); // Refresh list
        } catch (err) {
            setError(err.message || "Failed to start session.");
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!activeSession) return;
        setError('');
        try {
            setLoading(true);
            await endStudySession(currentStudentId, activeSession.session_id);
            setActiveSession(null); // Clear active session view
            setActiveSessionTimer(0);
            if (timerIntervalId) clearInterval(timerIntervalId);
            loadSessions(); // Refresh session list
            loadAvailableTasks(); // Tasks might have been completed
        } catch (err) {
            setError(err.message || "Failed to end session.");
        } finally {
            setLoading(false);
        }
    };
    
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (!currentStudentId) {
        return <p style={{ color: 'red' }}>Student ID not found. Please ensure you are logged in.</p>;
    }

    // Active Session View
    if (activeSession) {
        return (
            <div style={activeSessionStyle}>
                <h3>Active Session: {activeSession.title}</h3>
                <p style={{fontSize: '2em', fontWeight: 'bold'}}>{formatTime(activeSessionTimer)}</p>
                {activeSession.planned_duration_minutes && 
                    <p>Planned: {activeSession.planned_duration_minutes} mins</p>}
                <h4>Linked Tasks:</h4>
                {activeSession.linked_tasks_details && activeSession.linked_tasks_details.length > 0 ? (
                    <ul>
                        {activeSession.linked_tasks_details.map(task => (
                            <li key={task.task_id}>{task.description} (Status: {task.status})</li>
                        ))}
                    </ul>
                ) : <p>No tasks specifically linked to this session.</p>}
                <button onClick={handleEndSession} disabled={loading} style={buttonStyleActive}>
                    End Session
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>
        );
    }

    // Main View (Plan and List Sessions)
    return (
        <div style={{ padding: '20px' }}>
            <h3>My Study Sessions</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={() => setShowPlanForm(!showPlanForm)} style={{ marginBottom: '15px', padding: '10px' }}>
                {showPlanForm ? 'Cancel Plan Session' : 'Plan New Study Session'}
            </button>

            {showPlanForm && (
                <form onSubmit={handlePlanSession} style={formStyle}>
                    <h4>Plan New Session</h4>
                    <input name="title" value={newSession.title} onChange={handlePlanInputChange} placeholder="Session Title (e.g., Maths Ch 5)" />
                    <input name="planned_duration_minutes" type="number" value={newSession.planned_duration_minutes} onChange={handlePlanInputChange} placeholder="Planned Duration (mins)" />
                    <div>
                        <p>Link Tasks (Optional):</p>
                        {availableTasks.length === 0 && <small>No available tasks to link.</small>}
                        {availableTasks.map(task => (
                            <div key={task.task_id}>
                                <input 
                                    type="checkbox" 
                                    id={`task-${task.task_id}`} 
                                    checked={newSession.linked_task_ids.includes(task.task_id)}
                                    onChange={() => handleTaskSelectionChange(task.task_id)}
                                />
                                <label htmlFor={`task-${task.task_id}`}>{task.description} (Due: {task.due_date || 'N/A'})</label>
                            </div>
                        ))}
                    </div>
                    <button type="submit" disabled={loading} style={{padding: '8px 15px'}}>Plan Session</button>
                </form>
            )}

            <h4>Session History</h4>
            {loading && sessions.length === 0 && <p>Loading sessions...</p>}
            {sessions.length === 0 && !loading && <p>No study sessions planned or recorded yet.</p>}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {sessions.map(session => (
                    <div key={session.session_id} style={sessionCardStyle(session.status)}>
                        <h5>{session.title || `Session ${session.session_id}`}</h5>
                        <p>Status: <strong>{session.status}</strong></p>
                        {session.planned_duration_minutes && <p>Planned: {session.planned_duration_minutes} mins</p>}
                        {session.actual_duration_minutes && <p>Actual: {session.actual_duration_minutes} mins</p>}
                        {session.start_time && <p>Started: {new Date(session.start_time).toLocaleString()}</p>}
                        {session.end_time && <p>Ended: {new Date(session.end_time).toLocaleString()}</p>}
                        {session.linked_task_ids && session.linked_task_ids.length > 0 && 
                            <p><small>Linked Tasks: {session.linked_task_ids.join(', ')}</small></p>}
                        
                        {session.status === 'planned' && (
                            <button onClick={() => handleStartSession(session.session_id)} disabled={loading} style={buttonStyle}>
                                Start Session
                            </button>
                        )}
                        {/* Add Edit/Delete for planned sessions if needed */}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles (can be moved to CSS)
const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '10px', 
    padding: '20px', border: '1px solid #ccc', borderRadius: '8px', 
    marginBottom: '20px', maxWidth: '500px', backgroundColor: '#f9f9f9'
};
const sessionCardStyle = (status) => ({
    border: '1px solid #ddd', borderRadius: '8px', padding: '15px',
    minWidth: '280px', maxWidth: '320px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: status === 'completed' ? '#e8f5e9' : (status === 'active' ? '#fff9c4' : (status === 'planned' ? '#e3f2fd' : 'white')),
});
const buttonStyle = { padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em', backgroundColor: '#2196f3', color: 'white' };
const activeSessionStyle = { padding: '20px', border: '2px solid #4caf50', borderRadius: '8px', backgroundColor: '#f0fff0', textAlign: 'center' };
const buttonStyleActive = { ...buttonStyle, backgroundColor: '#f44336', padding: '10px 20px', fontSize: '1.1em'};

export default StudySessionManager;
