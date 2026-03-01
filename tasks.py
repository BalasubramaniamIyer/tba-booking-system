from celery import Celery
import time

# Re-use our Docker Redis container as the Celery broker!
celery_app = Celery("tba_tasks", broker="redis://127.0.0.1:6380/0")

@celery_app.task
def send_booking_email(user_email: str, admin_email: str, event_name: str, seat_number: int):
    # Simulate the delay of connecting to an email server
    time.sleep(3)
    
    # Simulate the email being sent
    print("\n" + "="*40)
    print("📧 BACKGROUND TASK: EMAIL DISPATCHED")
    print("="*40)
    print(f"TO: {user_email}")
    print(f"CC: {admin_email}")
    print(f"SUBJECT: Ticket Confirmation - {event_name}")
    print(f"BODY: Your ticket is confirmed! You have booked Seat {seat_number} for '{event_name}'.")
    print("="*40 + "\n")
    
    return "Email successfully sent in background!"