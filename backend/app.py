# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.tasks import tasks_bp

from jobs.job_queue import start_worker
from database import engine  # ✅ import engine so Base can use it
from models.models import Base

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

Base.metadata.create_all(bind=engine)

start_worker()
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

@app.route("/")
def home():
    return {"message": "Narravance Task Engine is live!"}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
