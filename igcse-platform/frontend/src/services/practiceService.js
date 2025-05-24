// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000

/**
 * Fetches a personalized practice set for a specific student.
 * @param {number} studentId - The ID of the student for whom to generate the practice set.
 * @returns {Promise<object>} A promise that resolves to the practice set data.
 * The object should contain a title, suggested_duration_minutes, and an array of questions.
 * Each question should have id, text, and answer.
 */
export const generatePracticeSet = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/generate_practice_set`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error generating practice set for student ID ${studentId}:`, error);
        throw error; // Re-throw to be caught by the calling component
    }
};
