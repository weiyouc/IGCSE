from functools import wraps
from flask import request, jsonify
from ..models.user_model import User, RoleEnum

# This is a placeholder for proper JWT-based authentication.
# In a real application, you would get the user_id from a JWT token.
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # For now, expect 'X-Admin-User-Id' in headers. Replace with JWT later.
        admin_user_id = request.headers.get('X-Admin-User-Id') 
        
        if not admin_user_id:
            return jsonify({"error": "Admin user ID missing in headers"}), 401
        
        try:
            admin_user_id = int(admin_user_id)
        except ValueError:
            return jsonify({"error": "Invalid Admin user ID format"}), 400

        admin_user = User.query.get(admin_user_id)

        if not admin_user:
            return jsonify({"error": "Admin user not found"}), 403
        
        if admin_user.role != RoleEnum.ADMIN:
            return jsonify({"error": "User does not have admin privileges"}), 403
            
        # Pass the admin_user object or id to the route if needed
        # kwargs['current_admin_user'] = admin_user 
        return f(*args, **kwargs)
    return decorated_function
