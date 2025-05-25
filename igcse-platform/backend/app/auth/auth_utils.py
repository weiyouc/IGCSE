import re
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    """Hashes a password using werkzeug."""
    return generate_password_hash(password)

def check_password(hashed_password, password):
    """Verifies a password against its hash."""
    return check_password_hash(hashed_password, password)

def is_valid_email(email):
    """Basic email validation."""
    if not email:
        return False
    # Simple regex for email validation
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

def is_strong_password(password):
    """Basic password strength validation."""
    if not password or len(password) < 8:
        return False
    # Add more checks like uppercase, lowercase, numbers, symbols if needed
    return True
