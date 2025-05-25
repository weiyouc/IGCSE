// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000

/**
 * Fetches details for a specific exam.
 * @param {number} examId - The ID of the exam to fetch.
 * @returns {Promise<object>} A promise that resolves to the exam details.
 */
export const fetchExamDetails = async (examId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching exam details for exam ID ${examId}:`, error);
        throw error;
    }
};

/**
 * Submits a student's exam attempt.
 * @param {object} submissionData - The data for the exam submission.
 * @param {number} submissionData.student_user_id - The ID of the student (user).
 * @param {number} submissionData.exam_id - The ID of the exam.
 * @param {object} submissionData.answers - The student's answers, e.g., {"q1": "answer1", "q2": "answer2"}.
 * @param {number} submissionData.time_taken_seconds - The time taken by the student in seconds.
 * @returns {Promise<object>} A promise that resolves to the server's response.
 */
export const submitExamAttempt = async (submissionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/exams/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting exam attempt:", error);
        throw error;
    }
};
