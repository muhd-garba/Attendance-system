import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const payload = await verifyJWT(token);
        if (!payload) return null;
        return payload;
    } catch (error) {
        return null;
    }
}
