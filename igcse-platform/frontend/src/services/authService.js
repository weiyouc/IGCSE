// Base URL for the backend API
// In a real application, this would likely come from an environment variable
const API_BASE_URL = 'http://localhost:5000/auth'; // Assuming Flask runs on port 5000

/**
 * Registers a new student.
 * @param {object} studentData - The student's registration data.
 * @param {string} studentData.email - The student's email.
 * @param {string} studentData.password - The student's password.
 * @param {string} studentData.first_name - The student's first name.
 * @param {string} studentData.last_name - The student's last name.
 * @returns {Promise<object>} The response from the server.
 */
export const registerStudent = async (studentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });
        const data = await response.json();
        if (!response.ok) {
            // Throw an error with the message from the backend if available
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error)
    {
        console.error("Error during student registration:", error);
        throw error; // Re-throw the error to be caught by the calling component
    }
};

/**
 * Logs in a user.
 * @param {object} credentials - The user's login credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} The response from the server, potentially including a token.
 */
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        // In a real app, you would store the token (e.g., in localStorage)
        // if (data.access_token) {
        //     localStorage.setItem('jwt_token', data.access_token);
        // }
        return data;
    } catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
};

// Add other auth-related service functions here if needed (e.g., logout, password reset)
