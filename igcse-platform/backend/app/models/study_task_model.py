from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from .user_model import Base # Assuming Base is defined in user_model.py or a common base file

class StudyTask(Base):
    __tablename__ = "study_tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=True)
    status = Column(String(50), default="pending", nullable=False) # e.g., "pending", "in_progress", "completed"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(Date, nullable=True)

    # Relationship (optional, if you need to access User object from StudyTask)
    # student = relationship("User", back_populates="study_tasks") # Define "study_tasks" in User model if needed

    def __repr__(self):
        return f"<StudyTask(task_id={self.task_id}, student_id={self.student_id}, status='{self.status}')>"
