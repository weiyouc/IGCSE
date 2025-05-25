// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api/admin';

// Helper to get admin user ID (placeholder for proper auth)
const getAdminUserIdHeader = () => {
    // In a real app, this would come from a JWT token or secure storage after admin login.
    // For demo, assuming admin user ID 3 (the one seeded in run.py if db is fresh and admin is 3rd user, or check db)
    // A better demo approach is to have the admin login and store their ID.
    // For now, let's prompt or use a fixed one.
    // const adminId = localStorage.getItem('adminUserId') || prompt("Enter Admin User ID for API calls:");
    // localStorage.setItem('adminUserId', adminId); // Store it for the session
    
    // The seeded admin in `run.py` is typically user_id 1 if it's the first user created after tables.
    // Let's assume the admin logs in and their ID (user_id) is stored.
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const loggedInUserRole = localStorage.getItem('loggedInUserRole');

    if (loggedInUserRole === 'admin' && loggedInUserId) {
        return { 'X-Admin-User-Id': loggedInUserId };
    }
    // Fallback or error if not an admin/not logged in.
    // For robust demo, ensure admin logs in first.
    console.warn("Admin User ID not found or user is not admin. API calls might fail.");
    // Defaulting to a common ID for sandbox testing if not found.
    // The seeded admin user via `run.py` has email admin@igcseplatform.com. Its ID needs to be checked.
    // If the DB is created fresh by `run.py`, and no other users were made first, it would be 1.
    // Let's assume it's 1 for now if not logged in.
    return { 'X-Admin-User-Id': loggedInUserId || '1' }; 
};


/**
 * Fetches all users. (Admin only)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 */
export const fetchAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                ...getAdminUserIdHeader(),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

/**
 * Fetches system-wide analytics summary. (Admin only)
 * @returns {Promise<object>} A promise that resolves to the analytics summary object.
 */
export const fetchAnalyticsSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
            method: 'GET',
            headers: {
                ...getAdminUserIdHeader(),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        throw error;
    }
};

/**
 * Creates a new user. (Admin only)
 * @param {object} userData - The user's data.
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.first_name
 * @param {string} userData.last_name
 * @param {string} userData.role - e.g., "STUDENT", "PARENT", "ADMIN"
 * @returns {Promise<object>} The response from the server.
 */
export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/create`, {
            method: 'POST',
            headers: {
                ...getAdminUserIdHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

/**
 * Updates an existing user. (Admin only)
 * @param {number} userId - The ID of the user to update.
 * @param {object} userData - The user data to update (e.g., first_name, last_name).
 * @returns {Promise<object>} The response from the server.
 */
export const updateUser = async (userId, userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/update`, {
            method: 'PUT',
            headers: {
                ...getAdminUserIdHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
    }
};
