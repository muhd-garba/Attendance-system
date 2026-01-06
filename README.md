# Attendance System

A simple web-based attendance system using Next.js, MongoDB, and Tailwind CSS.

## Features
- User Registration and Login
- JWT-based Authentication
- Role-based Access Control (User/Admin)
- Check-in (Sign In) and Check-out (Sign Out)
- Admin Dashboard to view all attendance records

## Prerequisites
- Node.js (v18+)
- MongoDB Database (Local or Atlas)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=mongodb://localhost:27017/attendance-system
   JWT_SECRET=your-secure-secret
   ```
   *Modify `MONGODB_URI` if you are using MongoDB Atlas.*

3. **Run the Application**
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### User
1. Register a new account.
2. Login to access the dashboard.
3. Click "Sign In" to record your attendance.
4. Click "Sign Out" when finished.

### Admin
- There is no direct Admin registration UI.
- To create an admin, you can manually edit the user's role in the database to `'admin'`, OR modify the registration API code temporarily to allow creating admins.
- Login with an admin account to access the Admin Dashboard at `/admin` (auto-redirects from login).
