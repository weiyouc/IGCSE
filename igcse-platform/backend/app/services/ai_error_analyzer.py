import re

def categorize_error(error_log_entry, exam_question_text=None):
    """
    Placeholder function to categorize an error based on simple rules.
    Updates the error_log_entry object directly with category and ai_confidence.

    Args:
        error_log_entry (ErrorLog): The ErrorLog object to categorize.
        exam_question_text (str, optional): The text of the exam question.
    """
    category = "Uncategorized"
    ai_confidence = 0.30 # Default confidence for uncategorized

    # Combine relevant text fields for keyword searching
    search_text = error_log_entry.correct_answer.lower()
    if exam_question_text:
        search_text += " " + exam_question_text.lower()
    if error_log_entry.student_answer:
        search_text += " " + error_log_entry.student_answer.lower()


    # Rule 1: Algebraic Manipulation
    algebra_keywords = ["algebra", "solve for x", "equation", "simplify", "variable", "polynomial"]
    if any(keyword in search_text for keyword in algebra_keywords):
        category = "Algebraic Manipulation"
        ai_confidence = 0.75
    
    # Rule 2: Conceptual Error (if not already algebraic)
    elif "definition" in search_text or "concept" in search_text or "explain" in search_text or "what is" in search_text:
        category = "Conceptual Error"
        ai_confidence = 0.70
        if "law" in search_text or "principle" in search_text:
            category = "Conceptual Error - Law/Principle"
            ai_confidence = 0.80

    # Rule 3: Calculation Error (if not algebraic or conceptual)
    # This is a bit tricky without comparing numbers directly.
    # We can look for numerical answers and assume if it's close but wrong, it might be calculation.
    # For now, a simpler check: if question or answer involves primarily numbers.
    elif re.search(r'\d', error_log_entry.correct_answer) and re.search(r'\d', error_log_entry.student_answer):
        # A more sophisticated check would involve parsing numbers and comparing
        # For example, if student_answer is a number and correct_answer is a number but they differ.
        # This is a very basic placeholder.
        if category == "Uncategorized": # Only if not already categorized
            category = "Calculation Error"
            ai_confidence = 0.65

    # Rule 4: Terminology Error
    elif "term" in search_text or "terminology" in search_text or "define" in search_text:
        if category == "Uncategorized":
            category = "Terminology Error"
            ai_confidence = 0.72


    # Update the error_log_entry directly
    error_log_entry.category = category
    error_log_entry.ai_confidence = ai_confidence

    # No return needed as we modify the object directly, but can return for chaining if preferred
    # return category, ai_confidence

# Example usage (not part of the module's execution path, just for illustration):
if __name__ == '__main__':
    class MockErrorLog:
        def __init__(self, student_answer, correct_answer, question_id):
            self.student_answer = student_answer
            self.correct_answer = correct_answer
            self.question_id = question_id
            self.category = None
            self.ai_confidence = None

        def __repr__(self):
            return f"Q: {self.question_id}, SA: {self.student_answer}, CA: {self.correct_answer} -> Cat: {self.category} ({self.ai_confidence})"

    mock_errors = [
        MockErrorLog("x=3", "x=5", "q1_algebra"),
        MockErrorLog("It's a force.", "Rate of change of displacement", "q2_physics_define_velocity"),
        MockErrorLog("140", "144", "q3_math_calc"),
        MockErrorLog("The main computer brain", "Central Processing Unit", "q4_cs_define_cpu")
    ]
    
    question_texts = {
        "q1_algebra": "Solve for x: 2x + 5 = 15",
        "q2_physics_define_velocity": "Define velocity.",
        "q3_math_calc": "What is 12 * 12?",
        "q4_cs_define_cpu": "What does CPU stand for?"
    }

    for err in mock_errors:
        categorize_error(err, exam_question_text=question_texts.get(err.question_id))
        print(err)
    
    # Example with more specific conceptual error
    err_concept_law = MockErrorLog("Objects stop if you don't push them", "An object at rest stays at rest...", "q5_physics_newton_law")
    categorize_error(err_concept_law, "What is Newton's first law of motion?")
    print(err_concept_law)
