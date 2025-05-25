from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .user_model import Base, User # Assuming User model is in user_model.py

class Parent(Base):
    __tablename__ = "parents"

    parent_id = Column(Integer, ForeignKey(User.user_id), primary_key=True)
    # A parent can have multiple students. Storing as JSON for simplicity.
    # A more robust solution would be a separate association table (ParentStudentLink).
    linked_student_user_ids = Column(JSON) 
    notification_preferences = Column(JSON)
    two_factor_secret = Column(String, nullable=True) # For 2FA

    user = relationship("User", backref="parent_profile") # one-to-one relationship

    def __repr__(self):
        return f"<Parent(parent_id={self.parent_id})>"
