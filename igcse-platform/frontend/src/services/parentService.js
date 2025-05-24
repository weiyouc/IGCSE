// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000

/**
 * Links a student to a parent account.
 * @param {object} linkData - The data for linking.
 * @param {number} linkData.parent_id - The ID of the parent (user).
 * @param {string} linkData.student_identifier - The email of the student to link.
 * @returns {Promise<object>} A promise that resolves to the server's response.
 */
export const linkStudentToParent = async (linkData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/parents/link_student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Add if JWT is implemented
            },
            body: JSON.stringify(linkData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("Error linking student to parent:", error);
        throw error;
    }
};

/**
 * Fetches the list of students linked to a parent.
 * @param {number} parentId - The ID of the parent (user).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of linked student objects.
 */
export const fetchLinkedStudents = async (parentId) => {
    try {
        // For GET requests, parameters are often sent as query strings
        const response = await fetch(`${API_BASE_URL}/parents/linked_students?parent_id=${parentId}`, {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Add if JWT is implemented
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data.linked_students || []; // Ensure it returns an array
    } catch (error) {
        console.error("Error fetching linked students:", error);
        throw error;
    }
};
