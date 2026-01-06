import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // Get today's record for this user
        const dateStr = new Date().toISOString().split('T')[0];

        // We want the LATEST record for today or specific logic? 
        // Requirement: "Each attendance record must capture only the date and time of sign-in and sign-out."
        // "A user must not be able to sign in again if they already have an active session without signing out."
        // This implies we look for a record where signOutTime is null?
        // And also we want to show the status.

        const record = await Attendance.findOne({
            user: session.id,
            date: dateStr,
            signOutTime: null
        }).sort({ createdAt: -1 });

        // If no active session, maybe they already signed out today? 
        // The requirement is simple: user view their "current attendance status".
        // I will return the latest record for today.

        const todayRecord = await Attendance.findOne({
            user: session.id,
            date: dateStr
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            record: todayRecord,
            status: todayRecord ? (todayRecord.signOutTime ? 'signed_out' : 'signed_in') : 'idle'
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('API Request Body:', body); // Debug log
        const { action, value } = body;

        await dbConnect();

        const dateStr = new Date().toISOString().split('T')[0];

        if (action === 'signin') {
            const { standup } = body; // Get standup value from body

            // Check if already has active session
            const activeRecord = await Attendance.findOne({
                user: session.id,
                signOutTime: null
            });

            if (activeRecord) {
                return NextResponse.json({ message: 'You are already signed in.' }, { status: 400 });
            }

            console.log('Signing in with standup:', standup); // Debug log

            const newRecord = await Attendance.create({
                user: session.id,
                date: dateStr,
                signInTime: new Date(),
                standup: standup || false, // Save it
            });

            return NextResponse.json({ message: 'Signed in successfully', record: newRecord });

        } else if (action === 'signout') {
            const activeRecord = await Attendance.findOne({
                user: session.id,
                signOutTime: null
            });

            if (!activeRecord) {
                return NextResponse.json({ message: 'No active session found.' }, { status: 400 });
            }

            activeRecord.signOutTime = new Date();
            await activeRecord.save();

            return NextResponse.json({ message: 'Signed out successfully', record: activeRecord });
        } else if (action === 'update_standup') {

            let todayRecord = await Attendance.findOne({
                user: session.id,
                date: dateStr
            }).sort({ createdAt: -1 });

            if (!todayRecord) {
                return NextResponse.json({ message: 'Please sign in first to mark standup.' }, { status: 400 });
            }

            console.log('Updating standup to:', value); // Debug log

            todayRecord.standup = value;
            await todayRecord.save();

            return NextResponse.json({ message: 'Standup status updated', record: todayRecord });
        } else {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
