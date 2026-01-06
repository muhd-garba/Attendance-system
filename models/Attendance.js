import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    signInTime: {
        type: Date,
        required: true,
    },
    signOutTime: {
        type: Date,
    },
    standup: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Ensure a user can only have one record per date? 
// The requirement says "create one record per date" usually, but here "A user must not be able to sign in again if they already have an active session without signing out."
// It implies checking for an *active* session (where signOutTime is null).
// I will index user and date just in case, but the logic will rely on `signOutTime: null`.

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
