from flask import Blueprint, jsonify, request
from ..app import db # Assuming db is initialized in your main app
from ..models.similar_question_model import SimilarQuestion
from ..models.exam_model import Exam # To fetch original question text
from ..services.ai_question_generator import AIQuestionGenerator

question_bp = Blueprint('questions', __name__, url_prefix='/api/questions')

# Initialize the AI Question Generator
# In a real app, API keys and model versions might come from config
ai_generator = AIQuestionGenerator()

@question_bp.route('/<string:original_question_id>/similar', methods=['GET'])
def get_similar_questions(original_question_id):
    """
    Generates and retrieves similar questions for a given original question ID.
    For now, it assumes the original_question_id refers to a question within an Exam's questions_data.
    It fetches the question text from an Exam to pass to the AI generator.
    """
    num_questions = request.args.get('count', default=3, type=int)
    if num_questions <= 0:
        return jsonify({"error": "Count must be a positive integer"}), 400

    # Fetch the original question text.
    # This is a simplified approach: assumes the question_id is unique across all exams
    # or that we have a way to identify the relevant exam.
    # For this example, let's find the first exam that contains this question_id.
    # In a real system, you might need exam_id as part of the route or request.
    original_question_text = None
    try:
        # Query all exams, then iterate through their questions_data
        # This is not efficient for large numbers of exams or questions.
        # A better approach would be a dedicated Question table or a more specific query.
        exams = Exam.query.all()
        found_question = False
        for exam in exams:
            if exam.questions_data:
                for q_data in exam.questions_data:
                    if isinstance(q_data, dict) and q_data.get('id') == original_question_id:
                        original_question_text = q_data.get('text')
                        found_question = True
                        break
            if found_question:
                break

        if not original_question_text:
            return jsonify({"error": "Original question not found or text is unavailable"}), 404

    except Exception as e:
        # Log error e
        return jsonify({"error": "Failed to retrieve original question text.", "details": str(e)}), 500

    try:
        # Check if similar questions already exist for this original_question_id and model
        # To avoid re-generating every time, you might add a check here.
        # For simplicity, we'll always generate for now.

        similar_ai_questions = ai_generator.generate_similar_questions(
            question_text=original_question_text,
            num_questions=num_questions
        )

        saved_similar_questions = []
        if similar_ai_questions:
            for sq_data in similar_ai_questions:
                new_similar_q = SimilarQuestion(
                    original_question_id=original_question_id,
                    similar_question_text=sq_data['text'],
                    ai_model_version=sq_data['model_version']
                )
                db.session.add(new_similar_q)
                # We need to flush to get IDs if we were to return them immediately,
                # but since we commit at the end, it's fine.
            db.session.commit() # Commit all new similar questions

            # Now query them back to include IDs and timestamps
            # This is one way; alternatively, use the objects after flushing if IDs are set up to populate.
            # Order by created_at to get the ones just inserted.
            saved_similar_questions_models = SimilarQuestion.query.filter_by(original_question_id=original_question_id)                                                                 .order_by(SimilarQuestion.created_at.desc())                                                                 .limit(len(similar_ai_questions)).all()

            # Reverse to maintain the order from the generator if it's important
            saved_similar_questions_models.reverse()

            saved_similar_questions = [
                {
                    "similar_question_id": sqm.similar_question_id,
                    "original_question_id": sqm.original_question_id,
                    "similar_question_text": sqm.similar_question_text,
                    "ai_model_version": sqm.ai_model_version,
                    "created_at": sqm.created_at.isoformat()
                } for sqm in saved_similar_questions_models
            ]

        return jsonify({
            "original_question_id": original_question_id,
            "original_question_text": original_question_text, # For context
            "similar_questions": saved_similar_questions
        }), 200

    except Exception as e:
        db.session.rollback()
        # Log error e
        return jsonify({"error": "An error occurred while generating or saving similar questions.", "details": str(e)}), 500

# Example of how to register this blueprint in your app/__init__.py:
# from .routes.question_routes import question_bp
# app.register_blueprint(question_bp)
