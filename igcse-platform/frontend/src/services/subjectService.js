// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000 and subjects are under /api

/**
 * Fetches all subjects from the backend.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of subject objects.
 * Each object should contain subject_id, name, and igcse_code.
 */
export const fetchSubjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        if (!response.ok) {
            // Try to get error message from backend
            const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        // Re-throw the error so it can be caught by the calling component
        // This allows components to handle loading states and display error messages
        throw error;
    }
};
