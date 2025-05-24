from flask import Blueprint, request, jsonify
from ..app import db
from ..models.user_model import User, RoleEnum
from ..models.parent_model import Parent
# For now, assume parent_id is passed in request. Later, use @jwt_required and get_jwt_identity
# from flask_jwt_extended import jwt_required, get_jwt_identity 

parent_bp = Blueprint('parents', __name__)

@parent_bp.route('/api/parents/link_student', methods=['POST'])
# @jwt_required() # Protect this route later
def link_student_to_parent():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    # parent_user_id = get_jwt_identity() # Use this when JWT is in place
    parent_user_id = data.get('parent_id') # For now, get from request body
    student_identifier = data.get('student_identifier') # Expecting student's email

    if not parent_user_id or not student_identifier:
        return jsonify({"error": "Missing parent_id or student_identifier"}), 400

    parent_user = User.query.get(parent_user_id)
    if not parent_user or parent_user.role != RoleEnum.PARENT:
        return jsonify({"error": "Parent account not found or user is not a parent"}), 404
    
    parent_profile = Parent.query.get(parent_user_id)
    if not parent_profile:
         return jsonify({"error": "Parent profile not found"}), 404 # Should not happen if User role is PARENT

    student_user = User.query.filter_by(email=student_identifier).first()
    if not student_user:
        return jsonify({"error": f"Student with email '{student_identifier}' not found."}), 404
    
    if student_user.role != RoleEnum.STUDENT:
        return jsonify({"error": f"User '{student_identifier}' is not a student."}), 400

    # Add student_id to parent's list if not already present
    if parent_profile.linked_student_user_ids is None:
        parent_profile.linked_student_user_ids = []

    if student_user.user_id not in parent_profile.linked_student_user_ids:
        # In SQLAlchemy, to trigger a change in a JSON field, you often need to reassign it
        # or use specific methods if using mutable JSON types.
        current_linked_ids = list(parent_profile.linked_student_user_ids) # Make a mutable copy
        current_linked_ids.append(student_user.user_id)
        parent_profile.linked_student_user_ids = current_linked_ids
        
        # Mark the field as modified if SQLAlchemy doesn't detect the change (often needed for JSON)
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(parent_profile, "linked_student_user_ids")
        
        db.session.add(parent_profile) # Add to session if it was detached or to mark dirty
        db.session.commit()
        return jsonify({"message": f"Student '{student_user.first_name} {student_user.last_name}' linked successfully."}), 200
    else:
        return jsonify({"message": f"Student '{student_user.first_name} {student_user.last_name}' is already linked."}), 200


@parent_bp.route('/api/parents/linked_students', methods=['GET'])
# @jwt_required() # Protect this route later
def get_linked_students():
    # parent_user_id = get_jwt_identity() # Use this when JWT is in place
    parent_user_id = request.args.get('parent_id', type=int) # For now, get from query param for GET request

    if not parent_user_id:
        return jsonify({"error": "Missing parent_id parameter"}), 400

    parent_user = User.query.get(parent_user_id)
    if not parent_user or parent_user.role != RoleEnum.PARENT:
        return jsonify({"error": "Parent account not found or user is not a parent"}), 404
    
    parent_profile = Parent.query.get(parent_user_id)
    if not parent_profile or parent_profile.linked_student_user_ids is None:
        return jsonify({"linked_students": []}), 200 # No students linked or profile issue

    linked_student_ids = parent_profile.linked_student_user_ids
    if not linked_student_ids: # Empty list
        return jsonify({"linked_students": []}), 200

    # Fetch details for linked students
    linked_students_users = User.query.filter(User.user_id.in_(linked_student_ids), User.role == RoleEnum.STUDENT).all()
    
    students_details = [
        {
            "user_id": student.user_id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email
        } for student in linked_students_users
    ]
    
    return jsonify({"linked_students": students_details}), 200
