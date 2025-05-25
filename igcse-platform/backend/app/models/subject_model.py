from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .user_model import Base  # Assuming Base is defined in user_model.py or a common base file

class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True) # e.g., "Mathematics", "Physics"
    igcse_code = Column(String, nullable=True) # e.g., "0580"

    # Relationship to exams (one subject can have many exams)
    # exams = relationship("Exam", back_populates="subject")

    def __repr__(self):
        return f"<Subject(subject_id={self.subject_id}, name='{self.name}')>"
