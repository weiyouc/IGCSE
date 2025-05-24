from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .user_model import Base  # Assuming Base is defined in user_model.py or a common base file
from .subject_model import Subject # Assuming Subject model is in subject_model.py

class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey(Subject.subject_id), nullable=False)
    title = Column(String, nullable=False) # e.g., "Mathematics Paper 1 - Practice"
    duration_minutes = Column(Integer, nullable=False)
    # For now, questions can be a JSON array of question IDs or simple text.
    # A more structured approach would be a separate Question model and a linking table (ExamQuestionLink).
    questions_data = Column(JSON) 
    # exam_type = Column(String) # e.g. "Multiple Choice", "Structured Answers"
    # difficulty_level = Column(String) # e.g. "Beginner", "Intermediate", "Advanced"
    
    subject = relationship("Subject", backref="exams") # Many-to-one relationship

    # Relationship to student attempts (one exam can have many attempts)
    # attempts = relationship("StudentExamAttempt", back_populates="exam")

    def __repr__(self):
        return f"<Exam(exam_id={self.exam_id}, title='{self.title}', subject_id={self.subject_id})>"
