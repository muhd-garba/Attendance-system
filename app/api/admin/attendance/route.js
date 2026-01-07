import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import User from '@/models/User'; // Ensure User model is loaded
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        // Populate user details
        const records = await Attendance.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ records });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
