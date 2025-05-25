from flask import Blueprint, jsonify
from ..models.student_exam_attempt_model import StudentExamAttempt
from ..models.exam_model import Exam
from ..models.user_model import User
from ..models.error_log_model import ErrorLog
from ..app import db

student_bp = Blueprint('students', __name__)

@student_bp.route('/api/students/<int:student_user_id>/attempts', methods=['GET'])
def get_student_attempts(student_user_id):
    """
    Fetches all exam attempts for a given student.
    Includes exam title and score.
    """
    # Validate if the student_user_id corresponds to an actual student
    student = User.query.filter_by(user_id=student_user_id, role='student').first()
    if not student:
        # Or, if we want to be more specific about the user not being a student vs not existing:
        # user = User.query.get(student_user_id)
        # if not user:
        #     return jsonify({"error": "User not found"}), 404
        # if user.role.value != 'student':
        #     return jsonify({"error": "User is not a student"}), 403
        return jsonify({"error": "Student not found or user is not a student"}), 404

    try:
        attempts = db.session.query(
            StudentExamAttempt.attempt_id,
            StudentExamAttempt.exam_id,
            Exam.title.label("exam_title"), # Get exam title via join
            StudentExamAttempt.completed_at,
            StudentExamAttempt.score
        ).join(Exam, StudentExamAttempt.exam_id == Exam.exam_id)\
         .filter(StudentExamAttempt.student_user_id == student_user_id)\
         .order_by(StudentExamAttempt.completed_at.desc())\
         .all()

        attempts_list = [
            {
                "attempt_id": attempt.attempt_id,
                "exam_id": attempt.exam_id,
                "exam_title": attempt.exam_title,
                # Format completed_at for better readability if it's a datetime object
                "submitted_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
                "score": attempt.score if attempt.score is not None else "Pending" # Or "N/A"
            } for attempt in attempts
        ]
        return jsonify(attempts_list), 200
    except Exception as e:
        # Log the error e (e.g., using current_app.logger.error(str(e)))
        return jsonify({"error": "An unexpected error occurred while fetching student attempts.", "details": str(e)}), 500


@student_bp.route('/api/students/<int:student_user_id>/generate_practice_set', methods=['GET'])
def generate_practice_set(student_user_id):
    """
    Generates a practice set for a student based on their logged errors.
    """
    student = User.query.filter_by(user_id=student_user_id, role='student').first()
    if not student:
        return jsonify({"error": "Student not found or user is not a student"}), 404

    try:
        # Fetch relevant errors (status 'logged' or 'reviewed')
        # For simplicity, let's take the 10 most recent logged errors.
        # In a real app, you might have more complex logic for selecting errors.
        errors_to_practice = ErrorLog.query.filter_by(student_id=student_user_id)\
                                           .filter(ErrorLog.status.in_(['logged', 'reviewed']))\
                                           .order_by(ErrorLog.logged_at.desc())\
                                           .limit(10)\
                                           .all()

        if not errors_to_practice:
            return jsonify({"message": "No errors found to generate a practice set.", "questions": []}), 200

        practice_questions = []
        for error in errors_to_practice:
            exam = Exam.query.get(error.exam_id)
            if not exam or not exam.questions_data:
                continue # Skip if exam or its questions are not found

            # Find the specific question from the exam's questions_data
            original_question = None
            for q in exam.questions_data:
                if q.get('id') == error.question_id:
                    original_question = q
                    break
            
            if original_question:
                # Add the question to the practice set. Include necessary details.
                # We don't include the student's previous wrong answer here, just the question and correct answer.
                practice_questions.append({
                    "id": original_question.get('id'), # Keep original question ID for reference
                    "text": original_question.get('text'),
                    "answer": original_question.get('answer'), # Correct answer for review
                    "original_exam_id": error.exam_id,
                    "error_log_id": error.error_id # For reference, if needed
                })

        # Optional: Update ErrorLog status (e.g., to 'in_practice_set')
        # for error in errors_to_practice:
        #    if any(pq['error_log_id'] == error.error_id for pq in practice_questions): # check if question was successfully added
        #        error.status = 'in_practice_set' 
        # db.session.commit()

        return jsonify({
            "title": f"Personalized Practice Set for {student.first_name} {student.last_name}",
            "suggested_duration_minutes": len(practice_questions) * 2, # e.g., 2 minutes per question
            "questions": practice_questions
        }), 200

    except Exception as e:
        # Log the error e
        db.session.rollback() # Rollback if status update was attempted and failed
        return jsonify({"error": "An unexpected error occurred while generating the practice set.", "details": str(e)}), 500

# Placeholder for other student-specific routes, e.g., profile management.
