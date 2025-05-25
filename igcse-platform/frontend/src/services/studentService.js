// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000

/**
 * Fetches all exam attempts for a specific student.
 * @param {number} studentId - The ID of the student whose attempts are to be fetched.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of attempt objects.
 * Each object should contain attempt_id, exam_id, exam_title, submitted_at, and score.
 */
export const fetchStudentAttempts = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/attempts`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching attempts for student ID ${studentId}:`, error);
        throw error; // Re-throw to be caught by the calling component
    }
};

// Add other student-related service functions here if needed
// For example, fetching student profile, updating preferences, etc.
