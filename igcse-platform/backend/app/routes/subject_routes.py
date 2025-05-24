from flask import Blueprint, jsonify
from ..models.subject_model import Subject # Assuming Subject model is in ../models/subject_model.py
from ..app import db # Assuming db is initialized in app.py or similar

subject_bp = Blueprint('subjects', __name__)

@subject_bp.route('/api/subjects', methods=['GET'])
def get_subjects():
    """
    Fetches all subjects from the database.
    """
    try:
        subjects = Subject.query.all()
        subjects_list = [
            {
                "subject_id": subject.subject_id,
                "name": subject.name,
                "igcse_code": subject.igcse_code
            } for subject in subjects
        ]
        return jsonify(subjects_list), 200
    except Exception as e:
        # Log the error e
        return jsonify({"error": "An unexpected error occurred while fetching subjects.", "details": str(e)}), 500

# Placeholder for other subject-related routes if needed in the future
# For example, adding a new subject (admin only), updating a subject, etc.
