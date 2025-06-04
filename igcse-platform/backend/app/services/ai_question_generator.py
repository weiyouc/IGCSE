import time
import random

class AIQuestionGenerator:
    def __init__(self, api_key=None, model_version="mock-0.1"):
        # In a real scenario, you would initialize your AI client here
        # For example: from openai import OpenAI
        # self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model_version = model_version
        self.mock_responses = [
            "What is the primary function of the mitochondria?",
            "Explain the process of photosynthesis in plants.",
            "Describe the structure of a eukaryotic cell.",
            "What are the differences between mitosis and meiosis?",
            "How does natural selection lead to evolution?"
        ]

    def generate_similar_questions(self, question_text: str, num_questions: int = 3):
        """
        Generates a list of questions similar to the input question_text.
        This is a mock implementation.

        Args:
            question_text (str): The original question.
            num_questions (int): The number of similar questions to generate.

        Returns:
            list[dict]: A list of dictionaries, where each dictionary contains
                        'text' (str) and 'model_version' (str).
        """
        # Simulate API call latency
        time.sleep(random.uniform(0.5, 1.5))

        if not question_text:
            # Handle empty input if necessary, though typically an AI would still try
            return []

        generated_questions = []
        # Ensure we don't request more mock questions than available, or duplicate them if not enough
        selected_mocks = random.sample(self.mock_responses, min(num_questions, len(self.mock_responses)))

        for i in range(min(num_questions, len(selected_mocks))):
            # In a real scenario, the AI would generate this based on question_text
            # Here, we just pick from our mock list.
            # We could add a bit more mock "intelligence" by, for example,
            # trying to pick mocks that share some keywords with question_text,
            # but for a basic placeholder, random selection is fine.
            generated_questions.append({
                "text": selected_mocks[i] + f" (Similar to: '{question_text[:30]}...')", # Mock similarity
                "model_version": self.model_version
            })

        return generated_questions

# Example usage (for testing this file directly)
if __name__ == '__main__':
    generator = AIQuestionGenerator()

    original_question_1 = "What is the powerhouse of the cell?"
    similar_qs_1 = generator.generate_similar_questions(original_question_1, num_questions=2)
    print(f"Original: {original_question_1}")
    for q in similar_qs_1:
        print(f"  - Similar: {q['text']} (Model: {q['model_version']})")

    original_question_2 = "Explain Newton's first law of motion."
    similar_qs_2 = generator.generate_similar_questions(original_question_2, num_questions=4) # Requesting more than available unique mocks
    print(f"Original: {original_question_2}")
    for q in similar_qs_2:
        print(f"  - Similar: {q['text']} (Model: {q['model_version']})")

    original_question_3 = "" # Empty question
    similar_qs_3 = generator.generate_similar_questions(original_question_3, num_questions=2)
    print(f"Original: {original_question_3}")
    if not similar_qs_3:
        print("  - No similar questions generated for empty input.")
    else:
        for q in similar_qs_3:
            print(f"  - Similar: {q['text']} (Model: {q['model_version']})")
