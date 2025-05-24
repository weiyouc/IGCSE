// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get student user ID (placeholder for proper auth)
const getStudentAuthHeaders = (studentId) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const loggedInUserRole = localStorage.getItem('loggedInUserRole');
    const idToUse = studentId || loggedInUserId;

    if (loggedInUserRole === 'student' && idToUse) {
        return { 'X-Student-User-Id': idToUse.toString() };
    }
    console.warn("Student User ID for headers not matching or not found. API calls might fail authorization.");
    return { 'X-Student-User-Id': idToUse ? idToUse.toString() : '' }; // Send if available, backend validates
};

/**
 * Creates/plans a new study session for a student.
 * @param {number} studentId - The ID of the student.
 * @param {object} sessionData - Data for the new session (title, planned_duration_minutes, linked_task_ids).
 * @returns {Promise<object>} The response from the server.
 */
export const createStudySession = async (studentId, sessionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/`, {
            method: 'POST',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error creating study session for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Lists all study sessions for a student.
 * @param {number} studentId - The ID of the student.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of session objects.
 */
export const listStudySessions = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/`, {
            method: 'GET',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching study sessions for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Gets details of a specific study session.
 * @param {number} studentId - The ID of the student.
 * @param {number} sessionId - The ID of the session.
 * @returns {Promise<object>} The session details including linked tasks.
 */
export const getStudySessionDetails = async (studentId, sessionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                ...getStudentAuthHeaders(studentId),
                 'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for session ${sessionId}:`, error);
        throw error;
    }
};

/**
 * Starts a study session.
 * @param {number} studentId - The ID of the student.
 * @param {number} sessionId - The ID of the session to start.
 * @returns {Promise<object>} The response from the server.
 */
export const startStudySession = async (studentId, sessionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/${sessionId}/start`, {
            method: 'POST',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error starting session ${sessionId}:`, error);
        throw error;
    }
};

/**
 * Ends a study session.
 * @param {number} studentId - The ID of the student.
 * @param {number} sessionId - The ID of the session to end.
 * @returns {Promise<object>} The response from the server.
 */
export const endStudySession = async (studentId, sessionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/${sessionId}/end`, {
            method: 'POST',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error ending session ${sessionId}:`, error);
        throw error;
    }
};

/**
 * Updates a planned study session.
 * @param {number} studentId - The ID of the student.
 * @param {number} sessionId - The ID of the session to update.
 * @param {object} sessionData - Data to update (title, planned_duration_minutes, linked_task_ids).
 * @returns {Promise<object>} The response from the server.
 */
export const updatePlannedStudySession = async (studentId, sessionId, sessionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error updating planned session ${sessionId}:`, error);
        throw error;
    }
};
