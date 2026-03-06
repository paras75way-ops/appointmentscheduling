# Appointment Booking Platform

Welcome to the Appointment Booking Platform! This is a full-stack web application designed to help clinics, salons, coworking spaces, and other service providers manage appointments and staff schedules effortlessly. 

## Key Features
- **User Booking Flow:** Browse organizations, view available slots dynamically, and book appointments in your local timezone.
- **Admin Dashboard:** Manage organization details, business hours, services, and staff. Configure granular rescheduling/cancellation policies.
- **Staff Portal:** Dedicated views for staff members to check their daily schedules and manage their assigned appointments.
- **Automated Reminders:** Background workers send automated email reminders before scheduled appointments.
- **Secure Authentication:** Role-based access control (RBAC) securely separates users, admins, and staff members.

## Tech Stack
- **Frontend:** React, React Router v7, Tailwind CSS, RTK Query (Redux Toolkit), Zod Validation
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Nodemailer,cron for scheduling mails 

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

## How to Run the Project Locally

### 1. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend/appointmentbackend
```

Install the dependencies:
```bash
npm install
```

Configure your environment variables:
Create a `.env` file in the `backend/appointmentbackend` directory. Here is an example:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/appointments
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_SECRET=your_access_secret

FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```
*Note: You can get the `EMAIL_USER` and `EMAIL_PASS` by creating an App Password in your Google Account settings.*

Start the backend development server:
```bash
npm run dev
```
The backend API should now be running on `http://localhost:5000`.

### 2. Setup the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend/appointmentfrontend
```

Install the dependencies:
```bash
npm install
```

Configure your environment variables:
Create a `.env` file in the `frontend/appointmentfrontend` directory and add your backend API URL (if different from default):
```env
VITE_API_URL=http://localhost:5000/api
Backend_url=http://localhost:5000/api/auth
```

Start the frontend development server:
```bash
npm run dev
```
The frontend should now be running on `http://localhost:5173`. Open this URL in your browser to view the application.

## Project Structure
- `/backend/` - Contains the Express REST API, MongoDB Mongoose schemas, and middleware logic.
- `/frontend/` - Contains the React User Interface, RTK Query API integrations, protected routing, and responsive pages.
