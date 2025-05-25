from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from .user_model import Base # Assuming Base is defined in user_model.py or a common base file

class StudySession(Base):
    __tablename__ = "study_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    title = Column(String, nullable=True)
    planned_duration_minutes = Column(Integer, nullable=True)
    actual_duration_minutes = Column(Integer, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="planned", nullable=False) # e.g., "planned", "active", "completed", "cancelled"
    linked_task_ids = Column(JSON, nullable=True) # Stores an array of task_ids
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship (optional)
    # student = relationship("User", back_populates="study_sessions") # Define "study_sessions" in User model

    def __repr__(self):
        return f"<StudySession(session_id={self.session_id}, student_id={self.student_id}, status='{self.status}')>"
