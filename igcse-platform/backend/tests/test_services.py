import unittest
from unittest.mock import patch
from app.services.ai_question_generator import AIQuestionGenerator

class TestAIQuestionGenerator(unittest.TestCase):

    def setUp(self):
        self.generator = AIQuestionGenerator(api_key="test_key", model_version="test_mock-0.1")

    def test_generate_similar_questions_mock_success(self):
        original_question = "What is photosynthesis?"
        num_q = 2
        similar_questions = self.generator.generate_similar_questions(original_question, num_questions=num_q)

        self.assertEqual(len(similar_questions), num_q)
        for q_data in similar_questions:
            self.assertIn("text", q_data)
            self.assertIn("model_version", q_data)
            self.assertEqual(q_data["model_version"], "test_mock-0.1")
            self.assertTrue(original_question[:10] in q_data["text"]) # Check mock similarity string

    def test_generate_similar_questions_empty_input(self):
        similar_questions = self.generator.generate_similar_questions("", num_questions=2)
        self.assertEqual(len(similar_questions), 0)

    def test_generate_similar_questions_more_than_mocks_available(self):
        # The mock service has 5 predefined responses
        original_question = "Explain gravity."
        num_q = 7
        similar_questions = self.generator.generate_similar_questions(original_question, num_questions=num_q)

        # It should return at most the number of unique mock responses
        self.assertEqual(len(similar_questions), len(self.generator.mock_responses))

    @patch('app.services.ai_question_generator.time.sleep') # Mock time.sleep to speed up tests
    def test_generate_similar_questions_calls_sleep(self, mock_sleep):
        self.generator.generate_similar_questions("Some question", num_questions=1)
        mock_sleep.assert_called_once()

if __name__ == '__main__':
    unittest.main()
