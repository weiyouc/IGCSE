import unittest
import json
from app import create_app, db
from app.models.exam_model import Exam
from app.models.similar_question_model import SimilarQuestion
# Assuming your app structure allows this kind of import for testing
# You might need to adjust based on your test setup (e.g., Flask-Testing)

class TestQuestionRoutes(unittest.TestCase):

    def setUp(self):
        self.app = create_app(config_name='testing') # Assumes you have a 'testing' config
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Add a dummy exam with a question
        self.exam1 = Exam(
            subject_id=1, # Assuming a subject with id 1 exists or is not strictly checked here
            title="Test Exam for Similar Questions",
            duration_minutes=60,
            questions_data=[
                {"id": "q1_test", "text": "What is the capital of France?", "answer": "Paris"},
                {"id": "q2_test", "text": "What is 2+2?", "answer": "4"}
            ]
        )
        db.session.add(self.exam1)
        db.session.commit()
        self.original_question_id = "q1_test"
        self.original_question_text = "What is the capital of France?"


    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_get_similar_questions_success(self):
        # Mock the AIQuestionGenerator's generate_similar_questions method
        # to avoid actual AI calls and control the output
        with patch('app.routes.question_routes.ai_generator.generate_similar_questions') as mock_generate:
            mock_generate.return_value = [
                {"text": "Which city is known as the capital of France?", "model_version": "mock-test-v1"},
                {"text": "Paris is the capital of which European country?", "model_version": "mock-test-v1"}
            ]

            response = self.client.get(f'/api/questions/{self.original_question_id}/similar?count=2')
            self.assertEqual(response.status_code, 200)

            data = json.loads(response.data.decode('utf-8'))
            self.assertEqual(data['original_question_id'], self.original_question_id)
            self.assertEqual(data['original_question_text'], self.original_question_text)
            self.assertEqual(len(data['similar_questions']), 2)

            self.assertEqual(data['similar_questions'][0]['similar_question_text'], "Which city is known as the capital of France?")
            self.assertEqual(data['similar_questions'][0]['ai_model_version'], "mock-test-v1")

            # Check if they were saved to the database
            saved_sq = SimilarQuestion.query.filter_by(original_question_id=self.original_question_id).all()
            self.assertEqual(len(saved_sq), 2)
            self.assertEqual(saved_sq[0].similar_question_text, "Which city is known as the capital of France?")

    def test_get_similar_questions_original_question_not_found(self):
        response = self.client.get('/api/questions/non_existent_q123/similar?count=2')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn("Original question not found", data['error'])

    def test_get_similar_questions_invalid_count(self):
        response = self.client.get(f'/api/questions/{self.original_question_id}/similar?count=0')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn("Count must be a positive integer", data['error'])

    @patch('app.routes.question_routes.ai_generator.generate_similar_questions')
    def test_get_similar_questions_ai_fails(self, mock_generate):
        mock_generate.side_effect = Exception("AI Service Unavailable")

        response = self.client.get(f'/api/questions/{self.original_question_id}/similar?count=2')
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn("An error occurred while generating or saving similar questions", data['error'])
        self.assertIn("AI Service Unavailable", data['details'])

        # Ensure no similar questions were saved if AI failed before commit
        saved_sq_count = SimilarQuestion.query.filter_by(original_question_id=self.original_question_id).count()
        self.assertEqual(saved_sq_count, 0)


if __name__ == '__main__':
    unittest.main()
