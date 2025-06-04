from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# from flask_jwt_extended import JWTManager # Will be added when JWT is fully implemented

# from ..config import Config # Adjusted path to config
from ..config import config # Import the config dictionary

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
# jwt = JWTManager() # Will be added when JWT is fully implemented

def create_app(config_name='default'):
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)
    # app.config.from_object(config_class)
    app.config.from_object(config[config_name])


    # Initialize Flask extensions here
    db.init_app(app)
    migrate.init_app(app, db)
    # jwt.init_app(app) # Will be added when JWT is fully implemented

    # Register blueprints here
    # from .auth.routes import auth_bp
    from .auth.routes import auth_bp # Make sure this import is correct
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # from .main import main_bp # Example for other parts of the app
    # app.register_blueprint(main_bp)

    from .routes.subject_routes import subject_bp # Import subject blueprint
    app.register_blueprint(subject_bp) # Register subject blueprint, typically with a url_prefix like /api

    from .routes.exam_routes import exam_bp # Import exam blueprint
    app.register_blueprint(exam_bp) # Register exam blueprint

    from .routes.student_routes import student_bp # Import student blueprint
    app.register_blueprint(student_bp) # Register student blueprint

    from .routes.error_log_routes import error_log_bp # Import error_log blueprint
    app.register_blueprint(error_log_bp) # Register error_log blueprint

    from .routes.parent_routes import parent_bp # Import parent blueprint
    app.register_blueprint(parent_bp) # Register parent blueprint

    from .routes.admin_routes import admin_bp # Import admin blueprint
    app.register_blueprint(admin_bp) # Register admin blueprint

    from .routes.study_task_routes import study_task_bp # Import study_task blueprint
    app.register_blueprint(study_task_bp) # Register study_task blueprint

    from .routes.study_session_routes import study_session_bp # Import study_session blueprint
    app.register_blueprint(study_session_bp) # Register study_session blueprint

    from .routes.question_routes import question_bp # Import question blueprint
    app.register_blueprint(question_bp) # Register question blueprint

    # Import models here to ensure they are registered with SQLAlchemy
    # before any database operations (like db.create_all() or migrations)
    # Ensure all models are imported so SQLAlchemy knows about them.
    from .models import user_model, student_model, parent_model, admin_model, subject_model, exam_model, student_exam_attempt_model # noqa

    # A simple test route
    @app.route('/hello')
    def hello():
        return 'Hello, World from Flask App!'

    return app
