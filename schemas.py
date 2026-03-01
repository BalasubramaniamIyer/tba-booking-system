# from pydantic import BaseModel, EmailStr
# from typing import Optional
# from datetime import datetime

# class UserCreate(BaseModel):
#     email: EmailStr
#     password: str
#     role: Optional[str] = "user"

# class UserOut(BaseModel):
#     id: int
#     email: EmailStr
#     role: str
#     class Config:
#         from_attributes = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class EventCreate(BaseModel):
#     name: str
#     total_seats: int
#     image_url: str | None = None

# class BookingCreate(BaseModel):
#     event_id: int
#     seat_number: int

from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "user"

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class EventCreate(BaseModel):
    name: str
    total_seats: int
    image_url: Optional[str] = None  # <-- THIS LETS THE FRONTEND SEND THE IMAGE!

class BookingCreate(BaseModel):
    event_id: int
    seat_number: int