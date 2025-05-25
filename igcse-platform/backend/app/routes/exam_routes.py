from flask import Blueprint, jsonify, request
from ..models.exam_model import Exam
from ..models.student_exam_attempt_model import StudentExamAttempt
from ..models.user_model import User
from ..models.error_log_model import ErrorLog
from ..services.ai_error_analyzer import categorize_error # Import the categorizer
from ..app import db
import datetime

exam_bp = Blueprint('exams', __name__)

@exam_bp.route('/api/exams/<int:exam_id>', methods=['GET'])
def get_exam_details(exam_id):
    """
    Fetches details for a specific exam.
    """
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({"error": "Exam not found"}), 404

        # Ensure questions_data is not None and is valid JSON-like structure
        questions = exam.questions_data if exam.questions_data else []
        
        return jsonify({
            "exam_id": exam.exam_id,
            "subject_id": exam.subject_id,
            "title": exam.title,
            "duration_minutes": exam.duration_minutes,
            "questions": questions # Assuming questions_data is the JSON field
        }), 200
    except Exception as e:
        # Log the error e
        return jsonify({"error": "An unexpected error occurred while fetching exam details.", "details": str(e)}), 500

@exam_bp.route('/api/exams/submit', methods=['POST'])
def submit_exam():
    """
    Submits an exam attempt by a student.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    student_user_id = data.get('student_user_id') # Ideally from JWT token
    exam_id = data.get('exam_id')
    student_answers = data.get('answers', {}) # e.g., {"q1": "4", "q2": "Paris"}
    # time_taken_seconds = data.get('time_taken_seconds') # Available if needed

    if not all([student_user_id, exam_id, student_answers is not None]): # time_taken_seconds is optional for now
        return jsonify({"error": "Missing required fields: student_user_id, exam_id, answers"}), 400

    student = User.query.get(student_user_id)
    if not student or student.role.value != 'student':
        return jsonify({"error": "Student not found or user is not a student"}), 404
        
    exam = Exam.query.get(exam_id)
    if not exam or not exam.questions_data:
        return jsonify({"error": "Exam not found or exam has no questions"}), 404

    correct_answers_map = {q['id']: {'text': q['text'], 'answer': q['answer']} for q in exam.questions_data}
    total_questions = len(correct_answers_map)
    student_correct_count = 0
    logged_error_ids = []

    try:
        for question_id, question_data in correct_answers_map.items():
            correct_answer_text = question_data['answer']
            question_text = question_data['text'] # Get question text for context
            student_answer_text = student_answers.get(question_id)
            
            is_correct = (student_answer_text is not None and 
                          student_answer_text.strip().lower() == correct_answer_text.strip().lower())

            if is_correct:
                student_correct_count += 1
            else:
                error_log_entry = ErrorLog(
                    student_id=student_user_id,
                    exam_id=exam_id,
                    question_id=question_id,
                    student_answer=student_answer_text if student_answer_text is not None else "N/A",
                    correct_answer=correct_answer_text,
                    status="logged"
                )
                # Call the categorizer
                categorize_error(error_log_entry, exam_question_text=question_text)
                
                db.session.add(error_log_entry)
                db.session.flush() 
                logged_error_ids.append(error_log_entry.error_id)
        
        # Calculate score
        score = (student_correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        new_attempt = StudentExamAttempt(
            student_user_id=student_user_id,
            exam_id=exam_id,
            answers=student_answers, # Store the student's original answers
            score=score,
            completed_at=datetime.datetime.now(datetime.timezone.utc),
            logged_errors=logged_error_ids # Store IDs of logged errors
        )
        db.session.add(new_attempt)
        db.session.commit()

        return jsonify({
            "message": "Exam submitted successfully. Score calculated and errors logged.",
            "attempt_id": new_attempt.attempt_id,
            "score": new_attempt.score,
            "correct_answers": student_correct_count,
            "total_questions": total_questions,
            "logged_error_count": len(logged_error_ids)
        }), 201

    except Exception as e:
        db.session.rollback()
        # Log the error e (e.g. app.logger.error(str(e)))
        return jsonify({"error": "An unexpected error occurred during exam submission and grading.", "details": str(e)}), 500
