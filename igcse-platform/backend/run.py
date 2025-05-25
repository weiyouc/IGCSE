import os
from app import create_app, db
from app.models.user_model import User, RoleEnum # Import User and RoleEnum
from app.models.admin_model import Admin # Import Admin model
from app.models.subject_model import Subject
from app.models.exam_model import Exam
from app.auth.auth_utils import hash_password # Import hash_password

# Create the Flask app instance
# You can specify a config environment like 'development', 'testing', 'production'
# For example: app = create_app(os.getenv('FLASK_CONFIG') or 'default')
app = create_app()

@app.shell_context_processor
def make_shell_context():
    """
    Allows you to work with database and models in the Flask shell
    without explicit imports.
    To use: flask shell
    """
    return {'db': db} # Add other models here: 'User': User, 'Student': Student

if __name__ == '__main__':
    # This is suitable for development.
    # For production, use a WSGI server like Gunicorn or uWSGI.
    # Example: gunicorn -w 4 -b 0.0.0.0:5000 run:app
    
    # Create database tables if they don't exist (for SQLite, mostly)
    # For more complex setups, Flask-Migrate (Alembic) is preferred.
    with app.app_context():
        db.create_all()
        print("Database tables checked/created.")

        # Pre-populate subjects if they don't exist
        sample_subjects = [
            {"name": "Mathematics", "igcse_code": "0580"},
            {"name": "Physics", "igcse_code": "0625"},
            {"name": "Chemistry", "igcse_code": "0620"},
            {"name": "Biology", "igcse_code": "0610"},
            {"name": "English as a Second Language", "igcse_code": "0510"},
            {"name": "Computer Science", "igcse_code": "0478"}
        ]

        for sub_data in sample_subjects:
            if not Subject.query.filter_by(name=sub_data["name"]).first():
                subject = Subject(name=sub_data["name"], igcse_code=sub_data["igcse_code"])
                db.session.add(subject)
        
        if Subject.query.count() >= len(sample_subjects): # A simple check
             print(f"{len(sample_subjects)} sample subjects are available or already existed.")
        
        db.session.commit()
        print("Sample subjects checked/populated.")

        # Pre-populate exams if they don't exist
        math_subject = Subject.query.filter_by(name="Mathematics").first()
        physics_subject = Subject.query.filter_by(name="Physics").first()

        sample_exams = []
        if math_subject:
            sample_exams.append({
                "subject_id": math_subject.subject_id,
                "title": "Mathematics Paper 1 - Algebra Basics",
                "duration_minutes": 60,
                "questions_data": [
                    {"id": "m1q1", "text": "Solve for x: 2x + 5 = 15", "answer": "x=5"},
                    {"id": "m1q2", "text": "What is 12 * 12?", "answer": "144"},
                    {"id": "m1q3", "text": "Simplify: 3(x - 2) + 4x", "answer": "7x - 6"}
                ]
            })
        if physics_subject:
            sample_exams.append({
                "subject_id": physics_subject.subject_id,
                "title": "Physics - Kinematics Practice",
                "duration_minutes": 45,
                "questions_data": [
                    {"id": "p1q1", "text": "Define velocity.", "answer": "Rate of change of displacement"},
                    {"id": "p1q2", "text": "A car accelerates from 0 to 60 m/s in 10 seconds. What is its acceleration?", "answer": "6 m/s^2"},
                    {"id": "p1q3", "text": "What is Newton's first law of motion?", "answer": "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force."}
                ]
            })

        for exam_data in sample_exams:
            if not Exam.query.filter_by(title=exam_data["title"]).first():
                exam = Exam(**exam_data)
                db.session.add(exam)
        
        # Quick check if exams were added
        if math_subject and Exam.query.filter_by(subject_id=math_subject.subject_id).count() > 0:
             print(f"Sample exams for {math_subject.name} are available or already existed.")
        if physics_subject and Exam.query.filter_by(subject_id=physics_subject.subject_id).count() > 0:
             print(f"Sample exams for {physics_subject.name} are available or already existed.")

        db.session.commit()
        print("Sample exams checked/populated.")

        # Ensure at least one admin user exists
        admin_email = "admin@igcseplatform.com"
        if not User.query.filter_by(email=admin_email).first():
            admin_user = User(
                email=admin_email,
                password_hash=hash_password("AdminPassword123!"), # Use a strong password
                first_name="Admin",
                last_name="User",
                role=RoleEnum.ADMIN
            )
            db.session.add(admin_user)
            db.session.flush() # Get user_id for Admin profile

            admin_profile = Admin(admin_id=admin_user.user_id)
            db.session.add(admin_profile)
            db.session.commit()
            print(f"Admin user '{admin_email}' created.")
        else:
            print(f"Admin user '{admin_email}' already exists.")


    app.run(debug=True, host='0.0.0.0', port=5000)
