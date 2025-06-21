from flask import jsonify
from flask_login import current_user
from functools import wraps

def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            if current_user.is_authenticated and current_user.role == required_role:
                return fn(*args, **kwargs)
            return jsonify({"error": "Unauthorized"}), 403
        return decorated_view
    return wrapper
