from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database import engine, get_db
import models, schemas, auth
import redis_client
from tasks import send_booking_email
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid

# 1. Create a local folder to store uploaded images!
os.makedirs("static", exist_ok=True)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TBA API")

# 2. Tell FastAPI to serve the static folder so React can load the images
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role == "admin":
        admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
        if admin_exists:
            raise HTTPException(status_code=400, detail="An admin already exists! Only one admin allowed.")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.put("/admin/approve/{user_email}")
def approve_manager(user_email: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "manager"
    db.commit()
    return {"message": f"User {user_email} has been officially approved as a manager!"}

# 3. NEW: Accept Multi-part Form Data for File Uploads!
@app.post("/events")
def create_event(
    name: str = Form(...),
    total_seats: int = Form(...),
    venue: str = Form(...),
    date: str = Form(...),
    price: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to create events.")
        
    image_url = None
    if image:
        # Generate a unique name for the file so it doesn't overwrite others
        ext = image.filename.split(".")[-1]
        safe_filename = f"{uuid.uuid4().hex}.{ext}"
        file_location = f"static/{safe_filename}"
        
        # Save the file to your hard drive
        with open(file_location, "wb+") as file_object:
            file_object.write(image.file.read())
            
        # Give the UI the URL to find it!
        image_url = f"http://127.0.0.1:8000/{file_location}"

    new_event = models.Event(
        name=name, 
        total_seats=total_seats, 
        venue=venue, 
        date=date, 
        price=price, 
        image_url=image_url
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete events.")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.query(models.Booking).filter(models.Booking.event_id == event_id).delete()
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@app.post("/book")
def book_seat(booking: schemas.BookingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user_seat_count = db.query(models.Booking).filter(models.Booking.event_id == booking.event_id, models.Booking.user_id == current_user.id).count()
    if user_seat_count >= 10:
        raise HTTPException(status_code=400, detail="Limit reached: You can only book a maximum of 10 seats per event!")

    lock_key = f"event:{booking.event_id}:seat:{booking.seat_number}"
    if redis_client.redis_db.get(lock_key):
        raise HTTPException(status_code=400, detail="Seat is currently locked by another user!")
    
    if db.query(models.Booking).filter(models.Booking.event_id == booking.event_id, models.Booking.seat_number == booking.seat_number).first():
        raise HTTPException(status_code=400, detail="Seat is already permanently booked!")

    redis_client.redis_db.setex(lock_key, 600, "locked")

    new_booking = models.Booking(user_id=current_user.id, event_id=booking.event_id, seat_number=booking.seat_number)
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()
    send_booking_email.delay(user_email=current_user.email, admin_email="admin@tba.com", event_name=event.name if event else "Unknown Event", seat_number=booking.seat_number)
    return {"message": "Seat successfully locked and booked!", "booking_id": new_booking.id}

@app.get("/events/{event_id}/booked_seats")
def get_booked_seats(event_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.event_id == event_id).all()
    return [b.seat_number for b in bookings]

@app.get("/bookings/me")
def get_my_bookings(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()

@app.get("/admin/reports")
def get_admin_reports(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    return {
        "platform_stats": {
            "total_users": db.query(models.User).filter(models.User.role == "user").count(),
            "total_managers": db.query(models.User).filter(models.User.role == "manager").count(),
            "total_events": db.query(models.Event).count(),
            "total_overall_bookings": db.query(models.Booking).count()
        },
        "event_stats": [{"event_name": e.name, "total_seats": e.total_seats, "booked_seats": db.query(models.Booking).filter(models.Booking.event_id == e.id).count()} for e in db.query(models.Event).all()]
    }