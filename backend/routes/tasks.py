# routes/tasks.py
from flask import Blueprint, request, jsonify, send_file
from sqlalchemy import func
from models.models import Task, Record, CarCompany
from database import SessionLocal
from jobs.job_queue import enqueue
from datetime import datetime
import csv
from io import StringIO, BytesIO


tasks_bp = Blueprint("tasks", __name__)

# Helper to safely parse dates
def safe_date(val):
    try:
        return datetime.strptime(val, "%Y-%m-%d") if val else None
    except Exception:
        return None

@tasks_bp.route("/", methods=["POST"])
def create_task():
    data = request.json
    with SessionLocal() as session:
        try:
            task = Task(
                name=data["name"],
                status="pending",
                created_at=datetime.utcnow(),
                start_date=safe_date(data["filters"].get("startDate")),
                end_date=safe_date(data["filters"].get("endDate")),
                companies=data["filters"].get("companies", [])
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            enqueue(task.id, data["filters"])
            return jsonify({"id": task.id, "status": task.status}), 201
        except Exception as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500

@tasks_bp.route("/", methods=["GET"])
def get_tasks():
    with SessionLocal() as session:
        tasks = session.query(Task).order_by(Task.created_at.desc()).all()
        return jsonify([{
            "id": t.id,
            "name": t.name,
            "status": t.status,
            "createdAt": t.created_at,
            "completedAt": t.completed_at,
            "startDate": t.start_date,
            "endDate": t.end_date,
            "companies": t.companies
        } for t in tasks])

@tasks_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=task_id).first()
        if not task:
            return jsonify({"error": "Task not found"}), 404
        return jsonify({
            "id": task.id,
            "name": task.name,
            "status": task.status,
            "createdAt": task.created_at,
            "completedAt": task.completed_at,
            "startDate": task.start_date,
            "endDate": task.end_date,
            "companies": task.companies
        })

@tasks_bp.route("/<int:task_id>/records", methods=["GET"])
def get_records(task_id):
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    source_filter = request.args.get("source", "all")
    company_filter = request.args.get("company", "all")

    with SessionLocal() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            return jsonify({"error": "Task not found"}), 404

        query = session.query(Record).filter(Record.task_id == task_id)

        if company_filter != "all":
            query = query.filter(Record.company == company_filter)
        if source_filter != "all":
            query = query.filter(Record.source == source_filter)
        if task.start_date:
            query = query.filter(Record.date >= task.start_date)
        if task.end_date:
            query = query.filter(Record.date <= task.end_date)

        total = query.count()
        records = query.offset(offset).limit(limit).all()

        return jsonify({
            "records": [{
                "id": r.id,
                "company": r.company,
                "model": r.model,
                "date": r.date.strftime("%Y-%m-%d"),
                "price": r.price,
                "color": r.color,
                "source": r.source
            } for r in records],
            "total": total,
            "page": page,
            "limit": limit
        })


@tasks_bp.route("/<int:task_id>/records/download", methods=["GET"])
def download_task_records(task_id):
    session = SessionLocal()
    records = session.query(Record).filter_by(task_id=task_id).all()
    session.close()

    # Step 1: Write CSV to a string buffer
    csv_string = StringIO()
    writer = csv.writer(csv_string)
    writer.writerow(["Company", "Model", "Date", "Price", "Color", "Source"])

    for r in records:
        writer.writerow([r.company, r.model, r.date.strftime("%Y-%m-%d"), r.price, r.color, r.source])

    # Step 2: Encode it into binary buffer
    csv_bytes = BytesIO()
    csv_bytes.write(csv_string.getvalue().encode("utf-8"))
    csv_bytes.seek(0)

    # Step 3: Send the binary buffer
    return send_file(
        csv_bytes,
        mimetype="text/csv",
        download_name=f"task_{task_id}_records.csv",
        as_attachment=True
    )


@tasks_bp.route("/<int:task_id>/summary", methods=["GET"])
def get_task_summary(task_id):
    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=task_id).first()
        if not task:
            return jsonify({"error": "Task not found"}), 404

        total_records = session.query(Record).filter_by(task_id=task_id).count()
        total_price = session.query(func.sum(Record.price)).filter_by(task_id=task_id).scalar()

        company_counts = dict(
            session.query(Record.company, func.count())
            .filter_by(task_id=task_id)
            .group_by(Record.company)
            .all()
        )

        daily_counts_raw = session.query(
            func.strftime("%Y-%m-%d", Record.date),
            Record.company,
            func.count()
        ).filter_by(task_id=task_id).group_by(Record.date, Record.company).all()

        daily_counts = {}
        for date, company, count in daily_counts_raw:
            if date not in daily_counts:
                daily_counts[date] = {}
            daily_counts[date][company] = count

        return jsonify({
            "totalRecords": total_records,
            "totalPrice": total_price or 0,
            "companyCounts": company_counts,
            "dailyCounts": daily_counts
        })

@tasks_bp.route("/companies", methods=["GET"])
def get_companies():
    with SessionLocal() as session:
        results = session.query(CarCompany.name).distinct().all()
        companies = sorted([name[0] for name in results])
        return jsonify(companies)
