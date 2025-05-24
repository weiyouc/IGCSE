from flask import Blueprint, request, jsonify
from ..app import db
from ..models.user_model import User, RoleEnum
from ..models.student_model import Student
from ..models.parent_model import Parent # Import Parent model
from .auth_utils import hash_password, check_password, is_valid_email, is_strong_password
# from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register/student', methods=['POST'])
def register_student():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    # Basic Input Validation
    if not all([email, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    if not is_strong_password(password):
        return jsonify({"error": "Password is not strong enough. Min 8 characters."}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409 # 409 Conflict

    try:
        hashed_pwd = hash_password(password)
        
        new_user = User(
            email=email,
            password_hash=hashed_pwd,
            first_name=first_name,
            last_name=last_name,
            role=RoleEnum.STUDENT
        )
        db.session.add(new_user)
        db.session.flush() # Flush to get the user_id for the student record

        new_student = Student(
            student_id=new_user.user_id 
            # Add any student-specific fields here if they are mandatory at registration
            # e.g., academic_preferences = data.get('academic_preferences', {})
        )
        db.session.add(new_student)
        db.session.commit()

        # For now, just a success message. Later, return JWT.
        # access_token = create_access_token(identity=new_user.user_id)
        # return jsonify(access_token=access_token), 201
        
        return jsonify({
            "message": "Student registered successfully",
            "user_id": new_user.user_id,
            "email": new_user.email,
            "role": new_user.role.value
        }), 201

    except Exception as e:
        db.session.rollback()
        # Log the error e
        return jsonify({"error": "An unexpected error occurred during registration.", "details": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found. Please check your email or register."}), 404

    if not check_password(user.password_hash, password):
        return jsonify({"error": "Incorrect password."}), 401

    # For now, just a success message. Later, return JWT.
    # access_token = create_access_token(identity=user.user_id)
    # return jsonify(access_token=access_token), 200
    
    return jsonify({
        "message": "Login successful",
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role.value
    }), 200


@auth_bp.route('/register/parent', methods=['POST'])
def register_parent():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not all([email, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    if not is_strong_password(password):
        return jsonify({"error": "Password is not strong enough. Min 8 characters."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        hashed_pwd = hash_password(password)
        
        new_user = User(
            email=email,
            password_hash=hashed_pwd,
            first_name=first_name,
            last_name=last_name,
            role=RoleEnum.PARENT # Set role to PARENT
        )
        db.session.add(new_user)
        db.session.flush() # Get user_id

        new_parent = Parent(
            parent_id=new_user.user_id,
            # linked_student_ids will be an empty list by default if model is set up with default=[] for JSON
            # Or initialize here: linked_student_ids=[] 
        )
        db.session.add(new_parent)
        db.session.commit()
        
        return jsonify({
            "message": "Parent registered successfully",
            "user_id": new_user.user_id,
            "email": new_user.email,
            "role": new_user.role.value
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred during parent registration.", "details": str(e)}), 500

# Placeholder for other auth routes if needed (e.g., logout, password reset)
