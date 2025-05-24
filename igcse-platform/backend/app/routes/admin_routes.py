from flask import Blueprint, request, jsonify
from ..app import db
from ..models.user_model import User, RoleEnum
from datetime import date, datetime, time
from ..models.student_model import Student
from ..models.parent_model import Parent
from ..models.admin_model import Admin
from ..models.student_exam_attempt_model import StudentExamAttempt # Import StudentExamAttempt
from ..models.error_log_model import ErrorLog # Import ErrorLog
from ..auth.auth_utils import hash_password, is_valid_email, is_strong_password
from ..auth.admin_auth import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    try:
        users = User.query.all()
        users_list = []
        for user in users:
            user_data = {
                "user_id": user.user_id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.value,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
                "role_specific_details": {}
            }
            if user.role == RoleEnum.STUDENT:
                student_profile = Student.query.get(user.user_id)
                if student_profile:
                    user_data["role_specific_details"]["student_id_in_table"] = student_profile.student_id
                    # Add more student specific details if needed
            elif user.role == RoleEnum.PARENT:
                parent_profile = Parent.query.get(user.user_id)
                if parent_profile:
                    user_data["role_specific_details"]["parent_id_in_table"] = parent_profile.parent_id
                    user_data["role_specific_details"]["linked_students_count"] = len(parent_profile.linked_student_user_ids or [])
            elif user.role == RoleEnum.ADMIN:
                admin_profile = Admin.query.get(user.user_id)
                if admin_profile:
                     user_data["role_specific_details"]["admin_id_in_table"] = admin_profile.admin_id
            users_list.append(user_data)
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch users.", "details": str(e)}), 500


@admin_bp.route('/users/create', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role_str = data.get('role', '').upper() # Default to empty string, then upper

    if not all([email, password, first_name, last_name, role_str]):
        return jsonify({"error": "Missing required fields: email, password, first_name, last_name, role"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400
    if not is_strong_password(password):
        return jsonify({"error": "Password is not strong enough. Min 8 characters."}), 400
    
    try:
        role = RoleEnum[role_str] # Convert string to RoleEnum member
    except KeyError:
        valid_roles = [r.name for r in RoleEnum]
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        hashed_pwd = hash_password(password)
        new_user = User(
            email=email,
            password_hash=hashed_pwd,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        db.session.add(new_user)
        db.session.flush() # To get new_user.user_id

        if role == RoleEnum.STUDENT:
            new_role_profile = Student(student_id=new_user.user_id)
        elif role == RoleEnum.PARENT:
            new_role_profile = Parent(parent_id=new_user.user_id, linked_student_user_ids=[])
        elif role == RoleEnum.ADMIN:
            new_role_profile = Admin(admin_id=new_user.user_id)
        else: # Should be caught by RoleEnum conversion, but as a safeguard
            db.session.rollback()
            return jsonify({"error": "Invalid role specified for profile creation"}), 400
        
        db.session.add(new_role_profile)
        db.session.commit()
        
        return jsonify({
            "message": f"{role.value.capitalize()} user created successfully.",
            "user_id": new_user.user_id,
            "email": new_user.email,
            "role": new_user.role.value
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred during user creation.", "details": str(e)}), 500


@admin_bp.route('/users/<int:user_id>/update', methods=['PUT']) # Using PUT for update
@admin_required
def update_user(user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    user_to_update = User.query.get(user_id)
    if not user_to_update:
        return jsonify({"error": "User not found"}), 404

    # Fields that can be updated by admin
    if 'first_name' in data:
        user_to_update.first_name = data['first_name']
    if 'last_name' in data:
        user_to_update.last_name = data['last_name']
    
    # For simplicity, role changes are not handled in this iteration.
    # Changing roles can be complex (e.g., migrating/deleting associated profiles).
    if 'role' in data and data['role'].upper() != user_to_update.role.name:
         return jsonify({"error": "Role changes are not supported in this version."}), 400
    
    if 'email' in data and data['email'] != user_to_update.email:
        if not is_valid_email(data['email']):
            return jsonify({"error": "Invalid email format"}), 400
        if User.query.filter(User.email == data['email'], User.user_id != user_id).first():
            return jsonify({"error": "Email already in use by another account"}), 409
        user_to_update.email = data['email']

    # Password update (optional, if provided)
    if 'password' in data and data['password']: # Check if password is not empty
        if not is_strong_password(data['password']):
            return jsonify({"error": "New password is not strong enough. Min 8 characters."}), 400
        user_to_update.password_hash = hash_password(data['password'])

    try:
        db.session.commit()
        return jsonify({
            "message": "User updated successfully.",
            "user_id": user_to_update.user_id,
            "email": user_to_update.email,
            "first_name": user_to_update.first_name,
            "last_name": user_to_update.last_name,
            "role": user_to_update.role.value
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred during user update.", "details": str(e)}), 500

# Optional: Deactivate/Delete user endpoint (can be added later)
# @admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
# @admin_required
# def deactivate_user(user_id):
#     # ... implementation ...
#     pass

@admin_bp.route('/analytics/summary', methods=['GET'])
@admin_required
def get_analytics_summary():
    try:
        total_students = User.query.filter_by(role=RoleEnum.STUDENT).count()
        total_parents = User.query.filter_by(role=RoleEnum.PARENT).count()
        total_admins = User.query.filter_by(role=RoleEnum.ADMIN).count()
        
        total_exam_attempts = StudentExamAttempt.query.count()
        total_errors_logged = ErrorLog.query.count()

        # Optional: New users today
        today_start = datetime.combine(date.today(), time.min)
        today_end = datetime.combine(date.today(), time.max)
        new_users_today = User.query.filter(User.created_at >= today_start, User.created_at <= today_end).count()

        summary = {
            "total_students": total_students,
            "total_parents": total_parents,
            "total_admins": total_admins,
            "total_exam_attempts": total_exam_attempts,
            "total_errors_logged": total_errors_logged,
            "new_users_today": new_users_today
        }
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch analytics summary.", "details": str(e)}), 500
