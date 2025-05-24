// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get student user ID (placeholder for proper auth)
// Similar to adminService, this would ideally come from a secure auth context.
const getStudentAuthHeaders = (studentId) => {
    // For demo, if studentId is not directly available from a global context,
    // we might rely on it being passed or try to get from localStorage.
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const loggedInUserRole = localStorage.getItem('loggedInUserRole');

    if (loggedInUserRole === 'student' && loggedInUserId && parseInt(loggedInUserId) === studentId) {
        return { 'X-Student-User-Id': loggedInUserId };
    }
    // Fallback or error if not the correct student/not logged in.
    // This demo relies on studentId being correctly passed to functions using this.
    console.warn("Student User ID for headers not matching or not found. API calls might fail authorization.");
    // Default to the studentId passed if no specific check, backend will do final auth.
    return { 'X-Student-User-Id': studentId.toString() };
};


/**
 * Creates a new study task for a student.
 * @param {number} studentId - The ID of the student.
 * @param {object} taskData - Data for the new task (description, estimated_duration_minutes, due_date).
 * @returns {Promise<object>} The response from the server.
 */
export const createTask = async (studentId, taskData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/tasks/`, {
            method: 'POST',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error creating task for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Lists all study tasks for a student.
 * @param {number} studentId - The ID of the student.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of task objects.
 */
export const listTasks = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/tasks/`, {
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
        console.error(`Error fetching tasks for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing study task.
 * @param {number} studentId - The ID of the student.
 * @param {number} taskId - The ID of the task to update.
 * @param {object} taskData - The data to update (e.g., description, status, due_date).
 * @returns {Promise<object>} The response from the server.
 */
export const updateTask = async (studentId, taskId, taskData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error updating task ${taskId} for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Deletes a study task.
 * @param {number} studentId - The ID of the student.
 * @param {number} taskId - The ID of the task to delete.
 * @returns {Promise<object>} The response from the server.
 */
export const deleteTask = async (studentId, taskId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                ...getStudentAuthHeaders(studentId),
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json(); // Attempt to parse JSON even for errors
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data; // Should be a success message
    } catch (error) {
        console.error(`Error deleting task ${taskId} for student ${studentId}:`, error);
        throw error;
    }
};
