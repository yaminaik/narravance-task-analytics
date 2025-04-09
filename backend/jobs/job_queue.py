import threading, time, logging
from datetime import datetime
from queue import Queue

from database import SessionLocal
from models.models import Task, Record
from utils.parser import load_json_data, load_csv_data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Thread-safe queue
job_queue = Queue()

def enqueue(task_id, filters):
    job_queue.put((task_id, filters))

def worker():
    while True:
        task_id, filters = job_queue.get()
        try:
            logger.info(f"🛠️ Starting task {task_id}")
            process_task(task_id, filters)
        except Exception as e:
            logger.error(f"❌ Error processing task {task_id}: {e}")
        finally:
            job_queue.task_done()
        time.sleep(0.2)

def process_task(task_id, filters):
    with SessionLocal() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            logger.warning(f"⚠️ Task {task_id} not found.")
            return

        task.status = "in_progress"
        session.commit()
        logger.info(f"⏳ Processing Task {task_id}")

        data = []
        if filters.get("sources", {}).get("jsonSource"):
            data += load_json_data(filters)
        if filters.get("sources", {}).get("csvSource"):
            data += load_csv_data(filters)

        logger.info(f"✅ Loaded {len(data)} filtered records for Task {task.id}")

        try:
            data.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"))
        except Exception as e:
            logger.warning(f"⚠️ Sort failed: {e}")

        records = [
            Record(
                task_id=task.id,
                company=item["company"],
                model=item["model"],
                price=float(item["price"]),
                date=datetime.strptime(item["date"], "%Y-%m-%d"),
                color=item["color"],
                source=item["source"]
            )
            for item in data
        ]

        session.bulk_save_objects(records)
        task.status = "completed"
        task.completed_at = datetime.utcnow()
        session.commit()
        logger.info(f"🎉 Task {task.id} marked completed.")

def start_worker():
    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
