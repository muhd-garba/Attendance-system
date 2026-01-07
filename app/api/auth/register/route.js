import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Only allow creating 'user' role by default unless admin logic is added later.
        // For this simple app, we might allow passing role for testing, or default to user.
        // But requirement says "two roles: user and admin". A simple way is to allow it in body for now.
        // Enforce 'user' role for all public registrations.
        // Admin accounts must be seeded or created directly in DB.
        const userRole = 'user';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        return NextResponse.json(
            { message: 'User created successfully', userId: user._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
