from flask import Blueprint, request, jsonify
from ..app import db
from ..models.user_model import User, RoleEnum
from ..models.study_task_model import StudyTask
from datetime import datetime as dt_datetime # To avoid conflict with model's datetime
# For now, assume student_id in URL is validated against authenticated user.
# from flask_jwt_extended import jwt_required, get_jwt_identity # For future use

study_task_bp = Blueprint('study_tasks', __name__, url_prefix='/api/students/<int:student_id>/tasks')

# Placeholder for student authentication/authorization check
# In a real app with JWT, this would be more robust.
def check_student_auth(student_id_from_url):
    # For demo, assume 'X-Student-User-Id' header. Replace with JWT.
    authenticated_user_id_str = request.headers.get('X-Student-User-Id')
    if not authenticated_user_id_str:
        return False, jsonify({"error": "Student User ID missing in headers"}), 401
    try:
        authenticated_user_id = int(authenticated_user_id_str)
    except ValueError:
        return False, jsonify({"error": "Invalid Student User ID format"}), 400

    if authenticated_user_id != student_id_from_url:
        return False, jsonify({"error": "Forbidden: You can only access your own tasks."}), 403
    
    user = User.query.get(authenticated_user_id)
    if not user or user.role != RoleEnum.STUDENT:
        return False, jsonify({"error": "User is not a student or not found."}), 403
        
    return True, None, None


@study_task_bp.route('/', methods=['POST'])
# @jwt_required() # Add this later
def create_task(student_id):
    # student_id_from_token = get_jwt_identity() # Use this with JWT
    # if student_id_from_token != student_id:
    #     return jsonify({"error": "Forbidden: You can only create tasks for yourself."}), 403
    
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok:
        return error_response, status_code

    data = request.get_json()
    if not data or not data.get('description'):
        return jsonify({"error": "Task description is required."}), 400

    description = data.get('description')
    estimated_duration_minutes = data.get('estimated_duration_minutes')
    due_date_str = data.get('due_date') # Expecting YYYY-MM-DD format

    due_date = None
    if due_date_str:
        try:
            due_date = dt_datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid due_date format. Expected YYYY-MM-DD."}), 400

    try:
        new_task = StudyTask(
            student_id=student_id,
            description=description,
            estimated_duration_minutes=estimated_duration_minutes,
            due_date=due_date
            # status defaults to "pending"
        )
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            "message": "Study task created successfully.",
            "task_id": new_task.task_id,
            "description": new_task.description,
            "status": new_task.status
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create task.", "details": str(e)}), 500


@study_task_bp.route('/', methods=['GET'])
# @jwt_required()
def list_tasks(student_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok:
        return error_response, status_code
        
    try:
        tasks = StudyTask.query.filter_by(student_id=student_id).order_by(StudyTask.due_date.asc(), StudyTask.created_at.desc()).all()
        tasks_list = [
            {
                "task_id": task.task_id,
                "description": task.description,
                "estimated_duration_minutes": task.estimated_duration_minutes,
                "status": task.status,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                "due_date": task.due_date.isoformat() if task.due_date else None
            } for task in tasks
        ]
        return jsonify(tasks_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch tasks.", "details": str(e)}), 500

@study_task_bp.route('/<int:task_id>', methods=['PUT'])
# @jwt_required()
def update_task(student_id, task_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok:
        return error_response, status_code

    task = StudyTask.query.filter_by(task_id=task_id, student_id=student_id).first()
    if not task:
        return jsonify({"error": "Task not found or not owned by student."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided for update."}), 400

    if 'description' in data:
        task.description = data['description']
    if 'estimated_duration_minutes' in data:
        task.estimated_duration_minutes = data.get('estimated_duration_minutes') # Allow setting to null
    if 'status' in data:
        # Add validation for allowed statuses if needed
        if data['status'] not in ["pending", "in_progress", "completed"]:
             return jsonify({"error": "Invalid status value."}), 400
        task.status = data['status']
    if 'due_date' in data:
        due_date_str = data.get('due_date')
        if due_date_str:
            try:
                task.due_date = dt_datetime.strptime(due_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid due_date format. Expected YYYY-MM-DD or null."}), 400
        else: # Allow setting due_date to null
            task.due_date = None
            
    try:
        db.session.commit()
        return jsonify({
            "message": "Task updated successfully.",
            "task_id": task.task_id,
            "status": task.status
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update task.", "details": str(e)}), 500


@study_task_bp.route('/<int:task_id>', methods=['DELETE'])
# @jwt_required()
def delete_task(student_id, task_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok:
        return error_response, status_code

    task = StudyTask.query.filter_by(task_id=task_id, student_id=student_id).first()
    if not task:
        return jsonify({"error": "Task not found or not owned by student."}), 404

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete task.", "details": str(e)}), 500
