from flask import Blueprint, request, jsonify
from ..app import db
from ..models.user_model import User, RoleEnum # For auth check
from ..models.study_session_model import StudySession
from ..models.study_task_model import StudyTask # To fetch task details
from datetime import datetime as dt_datetime, timezone

# Placeholder for student authentication/authorization check (same as in study_task_routes)
def check_student_auth(student_id_from_url):
    authenticated_user_id_str = request.headers.get('X-Student-User-Id')
    if not authenticated_user_id_str:
        return False, jsonify({"error": "Student User ID missing in headers"}), 401
    try:
        authenticated_user_id = int(authenticated_user_id_str)
    except ValueError:
        return False, jsonify({"error": "Invalid Student User ID format"}), 400

    if authenticated_user_id != student_id_from_url:
        return False, jsonify({"error": "Forbidden: You can only access your own sessions."}), 403
    
    user = User.query.get(authenticated_user_id)
    if not user or user.role != RoleEnum.STUDENT:
        return False, jsonify({"error": "User is not a student or not found."}), 403
        
    return True, None, None

study_session_bp = Blueprint('study_sessions', __name__, url_prefix='/api/students/<int:student_id>/sessions')

@study_session_bp.route('/', methods=['POST'])
def create_session(student_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON expected"}), 400

    title = data.get('title')
    planned_duration_minutes = data.get('planned_duration_minutes')
    linked_task_ids = data.get('linked_task_ids', []) # Expects a list of task IDs

    if not title and not linked_task_ids: # Require at least a title or some tasks
        return jsonify({"error": "Session title or linked tasks are required."}), 400
    if planned_duration_minutes is not None and not isinstance(planned_duration_minutes, int):
        return jsonify({"error": "planned_duration_minutes must be an integer."}), 400
    if not isinstance(linked_task_ids, list):
         return jsonify({"error": "linked_task_ids must be a list."}), 400


    try:
        new_session = StudySession(
            student_id=student_id,
            title=title,
            planned_duration_minutes=planned_duration_minutes,
            linked_task_ids=linked_task_ids, # Stored as JSON
            status="planned" 
        )
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify({
            "message": "Study session planned successfully.",
            "session_id": new_session.session_id,
            "title": new_session.title,
            "status": new_session.status
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to plan session.", "details": str(e)}), 500


@study_session_bp.route('/', methods=['GET'])
def list_sessions(student_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code
        
    try:
        sessions = StudySession.query.filter_by(student_id=student_id)\
            .order_by(StudySession.created_at.desc()).all()
        
        sessions_list = [
            {
                "session_id": s.session_id,
                "title": s.title,
                "planned_duration_minutes": s.planned_duration_minutes,
                "actual_duration_minutes": s.actual_duration_minutes,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "status": s.status,
                "linked_task_ids": s.linked_task_ids or [],
                "created_at": s.created_at.isoformat()
            } for s in sessions
        ]
        return jsonify(sessions_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch sessions.", "details": str(e)}), 500

@study_session_bp.route('/<int:session_id>', methods=['GET'])
def get_session_details(student_id, session_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code

    session = StudySession.query.filter_by(session_id=session_id, student_id=student_id).first()
    if not session:
        return jsonify({"error": "Session not found or not owned by student."}), 404

    linked_tasks_details = []
    if session.linked_task_ids:
        tasks = StudyTask.query.filter(StudyTask.task_id.in_(session.linked_task_ids), StudyTask.student_id == student_id).all()
        linked_tasks_details = [
            {"task_id": t.task_id, "description": t.description, "status": t.status, "due_date": t.due_date.isoformat() if t.due_date else None}
            for t in tasks
        ]
    
    return jsonify({
        "session_id": session.session_id,
        "title": session.title,
        "planned_duration_minutes": session.planned_duration_minutes,
        "actual_duration_minutes": session.actual_duration_minutes,
        "start_time": session.start_time.isoformat() if session.start_time else None,
        "end_time": session.end_time.isoformat() if session.end_time else None,
        "status": session.status,
        "linked_task_ids": session.linked_task_ids or [],
        "linked_tasks_details": linked_tasks_details, # Added details
        "created_at": session.created_at.isoformat()
    }), 200


@study_session_bp.route('/<int:session_id>/start', methods=['POST'])
def start_session(student_id, session_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code

    session = StudySession.query.filter_by(session_id=session_id, student_id=student_id).first()
    if not session:
        return jsonify({"error": "Session not found or not owned by student."}), 404
    
    if session.status not in ["planned", "active"]: # Can restart an active session if needed, or prevent if already active
        return jsonify({"error": f"Session cannot be started. Current status: {session.status}"}), 400

    session.status = "active"
    session.start_time = dt_datetime.now(timezone.utc)
    session.end_time = None # Clear end time if restarting
    session.actual_duration_minutes = None # Clear actual duration

    try:
        db.session.commit()
        return jsonify({"message": "Session started.", "session_id": session.session_id, "start_time": session.start_time.isoformat()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to start session.", "details": str(e)}), 500


@study_session_bp.route('/<int:session_id>/end', methods=['POST'])
def end_session(student_id, session_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code

    session = StudySession.query.filter_by(session_id=session_id, student_id=student_id).first()
    if not session:
        return jsonify({"error": "Session not found or not owned by student."}), 404

    if session.status != "active":
        return jsonify({"error": "Session is not active. Cannot end."}), 400
    if not session.start_time:
        return jsonify({"error": "Session start time is not recorded. Cannot calculate duration."}), 400

    session.status = "completed"
    session.end_time = dt_datetime.now(timezone.utc)
    
    duration_delta = session.end_time - session.start_time
    session.actual_duration_minutes = int(duration_delta.total_seconds() / 60)

    # Optionally, mark linked tasks as completed (if desired behavior)
    # if session.linked_task_ids:
    #     tasks_to_complete = StudyTask.query.filter(StudyTask.task_id.in_(session.linked_task_ids), StudyTask.student_id == student_id).all()
    #     for task in tasks_to_complete:
    #         task.status = "completed"
            
    try:
        db.session.commit()
        return jsonify({
            "message": "Session ended.", 
            "session_id": session.session_id, 
            "end_time": session.end_time.isoformat(),
            "actual_duration_minutes": session.actual_duration_minutes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to end session.", "details": str(e)}), 500

@study_session_bp.route('/<int:session_id>', methods=['PUT'])
def update_planned_session(student_id, session_id):
    auth_ok, error_response, status_code = check_student_auth(student_id)
    if not auth_ok: return error_response, status_code

    session = StudySession.query.filter_by(session_id=session_id, student_id=student_id).first()
    if not session:
        return jsonify({"error": "Session not found or not owned by student."}), 404
    
    if session.status != "planned":
        return jsonify({"error": "Only 'planned' sessions can be updated this way."}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided for update."}), 400
        
    if 'title' in data:
        session.title = data['title']
    if 'planned_duration_minutes' in data:
        session.planned_duration_minutes = data.get('planned_duration_minutes')
    if 'linked_task_ids' in data:
        if not isinstance(data['linked_task_ids'], list):
            return jsonify({"error": "linked_task_ids must be a list."}), 400
        session.linked_task_ids = data['linked_task_ids']
    
    # Ensure title or linked_task_ids is present after update
    if not session.title and not (session.linked_task_ids and len(session.linked_task_ids) > 0):
        return jsonify({"error": "Session must have a title or at least one linked task after update."}), 400

    try:
        db.session.commit()
        return jsonify({"message": "Planned session updated successfully.", "session_id": session.session_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update planned session.", "details": str(e)}), 500
