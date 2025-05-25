from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from .user_model import Base # Assuming Base is defined in user_model.py or a common base file

class ErrorLog(Base):
    __tablename__ = "error_logs"

    error_id = Column(Integer, primary_key=True, index=True)
    # student_id should refer to the user_id of a user with the 'STUDENT' role
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) 
    exam_id = Column(Integer, ForeignKey("exams.exam_id"), nullable=False)
    question_id = Column(String, nullable=False) # Refers to the 'id' within the exam's questions JSON
    student_answer = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="logged", nullable=False) # e.g., "logged", "reviewed", "in_practice_set"
    category = Column(String, nullable=True) # AI-assigned category
    ai_confidence = Column(Float, nullable=True) # Confidence score for the category

    # Relationships can be defined here if needed, e.g.,
    # student = relationship("User", foreign_keys=[student_id])
    # exam = relationship("Exam", foreign_keys=[exam_id])

    def __repr__(self):
        return f"<ErrorLog(error_id={self.error_id}, student_id={self.student_id}, exam_id={self.exam_id}, q_id='{self.question_id}')>"
