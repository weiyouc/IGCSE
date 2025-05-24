from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .user_model import Base, User  # Assuming User model is in user_model.py

class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(Integer, ForeignKey(User.user_id), primary_key=True)
    # Admin-specific fields can be added here if any in the future
    # For example, specific permissions or access logs related to admin actions

    user = relationship("User", backref="admin_profile") # one-to-one relationship

    def __repr__(self):
        return f"<Admin(admin_id={self.admin_id})>"
