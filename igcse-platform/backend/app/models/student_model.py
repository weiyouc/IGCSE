from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .user_model import Base, User  # Assuming User model is in user_model.py

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, ForeignKey(User.user_id), primary_key=True)
    academic_preferences = Column(JSON)  # e.g., preferred subjects, learning pace
    # Optionally, link to Parent if applicable - This can be a many-to-one relationship from Student to Parent
    # parent_id = Column(Integer, ForeignKey('parents.parent_id'), nullable=True) 

    user = relationship("User", backref="student_profile") # one-to-one relationship

    def __repr__(self):
        return f"<Student(student_id={self.student_id})>"
