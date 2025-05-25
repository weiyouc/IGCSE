from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .user_model import Base, User # Assuming User model is in user_model.py
from .exam_model import Exam # Assuming Exam model is in exam_model.py
# If Student model is separate and not just User with role 'student':
# from .student_model import Student 

class StudentExamAttempt(Base):
    __tablename__ = "student_exam_attempts"

    attempt_id = Column(Integer, primary_key=True, index=True)
    # Assuming student_id refers to the user_id of a user with the 'STUDENT' role
    student_user_id = Column(Integer, ForeignKey(User.user_id), nullable=False) 
    exam_id = Column(Integer, ForeignKey(Exam.exam_id), nullable=False)
    score = Column(Float, nullable=True) # Can be null if attempt is ongoing or not graded
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    answers = Column(JSON) # Storing student's answers, e.g., {"question_1_id": "answer_text", "question_2_id": "option_c"}
    logged_errors = Column(JSON, nullable=True) # e.g., {"question_3_id": "Incorrect", "question_5_id": "Partially correct"}

    # Relationships
    student = relationship("User", foreign_keys=[student_user_id]) # Link to the User model
    exam = relationship("Exam", backref="attempts") # Link to the Exam model

    def __repr__(self):
        return f"<StudentExamAttempt(attempt_id={self.attempt_id}, student_user_id={self.student_user_id}, exam_id={self.exam_id})>"
