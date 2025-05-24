from flask import Blueprint, jsonify
from ..models.error_log_model import ErrorLog
from ..app import db

error_log_bp = Blueprint('error_logs', __name__)

@error_log_bp.route('/api/errors/<int:error_id>', methods=['GET'])
def get_error_log_details(error_id):
    """
    Fetches details for a specific error log entry.
    """
    try:
        error_log = ErrorLog.query.get(error_id)
        if not error_log:
            return jsonify({"error": "ErrorLog entry not found"}), 404

        return jsonify({
            "error_id": error_log.error_id,
            "student_id": error_log.student_id,
            "exam_id": error_log.exam_id,
            "question_id": error_log.question_id,
            "student_answer": error_log.student_answer,
            "correct_answer": error_log.correct_answer,
            "logged_at": error_log.logged_at.isoformat() if error_log.logged_at else None,
            "status": error_log.status,
            "category": error_log.category,
            "ai_confidence": error_log.ai_confidence
        }), 200
    except Exception as e:
        # Log the error e
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

# Endpoint to list all errors for a student (optional, but good for seeing categories in action)
@error_log_bp.route('/api/students/<int:student_id>/errors', methods=['GET'])
def get_student_error_logs(student_id):
    """
    Fetches all error logs for a specific student, including categories.
    """
    try:
        # Basic check if student exists (optional, depends on how strict you want to be)
        # from ..models.user_model import User
        # student = User.query.get(student_id)
        # if not student or student.role.value != 'student':
        #     return jsonify({"error": "Student not found or user is not a student"}), 404

        errors = ErrorLog.query.filter_by(student_id=student_id).order_by(ErrorLog.logged_at.desc()).all()
        
        error_list = [
            {
                "error_id": err.error_id,
                "exam_id": err.exam_id,
                "question_id": err.question_id,
                "student_answer": err.student_answer,
                "correct_answer": err.correct_answer,
                "logged_at": err.logged_at.isoformat() if err.logged_at else None,
                "status": err.status,
                "category": err.category,
                "ai_confidence": err.ai_confidence
            } for err in errors
        ]
        return jsonify(error_list), 200
    except Exception as e:
        # Log the error e
        return jsonify({"error": "An unexpected error occurred while fetching student errors.", "details": str(e)}), 500
