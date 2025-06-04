from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from .user_model import Base  # Assuming Base is defined in user_model.py

class SimilarQuestion(Base):
    __tablename__ = "similar_questions"

    similar_question_id = Column(Integer, primary_key=True, index=True)
    original_question_id = Column(String, nullable=False, index=True) # Assuming original question ID is a string
    similar_question_text = Column(Text, nullable=False)
    ai_model_version = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # If you have an actual Question model, you might want to add a ForeignKey relationship:
    # original_question_id = Column(Integer, ForeignKey("questions.question_id"), nullable=False)
    # original_question = relationship("Question", back_populates="similar_questions_generated")

    def __repr__(self):
        return f"<SimilarQuestion(id={self.similar_question_id}, original_q_id='{self.original_question_id}')>"
