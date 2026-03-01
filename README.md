# TBA Ticket Booking System

A high-performance, full-stack booking application built with FastAPI and React.

## 🚀 Key Features
* **Role-Based Access:** Support for Users, Managers, and a single Super Admin.
* **Concurrency Control:** Redis-based seat locking to prevent double-booking.
* **Scalper Protection:** Strict limit of 10 tickets per user per event.
* **Real-time UI:** Seat maps update instantly from the backend state.
* **Media Handling:** Local file uploads for movie posters.
* **Background Processing:** Celery handles simulated email dispatching via Redis.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
* **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL
* **Cache/Broker:** Redis
* **Tasks:** Celery
* **Environment:** Docker & Docker Compose

## 📦 Setup Instructions
1. **Clone the Repo:** `git clone <repo-url>`
2. **Start Services:** `docker-compose up -d`
3. **Backend:** - `pip install -r requirements.txt`
   - `uvicorn main:app --reload`
4. **Frontend:**
   - `npm install`
   - `npm run dev`