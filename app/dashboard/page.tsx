"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AttendanceRecord {
    signInTime: string;
    signOutTime?: string;
    standup?: boolean;
}

export default function DashboardPage() {
    const [status, setStatus] = useState<string>('loading'); // 'loading' | 'idle' | 'signed_in' | 'signed_out'
    const [record, setRecord] = useState<AttendanceRecord | null>(null);
    const [standupChecked, setStandupChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchStatus();
    }, []);

    // Sync local checkbox with fetched record if exists
    useEffect(() => {
        if (record) {
            setStandupChecked(record.standup || false);
        }
    }, [record]);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/attendance');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setStatus(data.status);
            setRecord(data.record);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (action: 'signin' | 'signout' | 'update_standup', value?: boolean) => {
        try {
            const body: any = { action };

            if (action === 'signin') {
                // Send the local checkbox state during sign in
                body.standup = standupChecked;
            }

            if (action === 'update_standup') {
                body.value = value;
            }

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                fetchStatus();
            } else {
                const errorData = await res.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setStandupChecked(checked);

        // If we are already signed in, we also want to update the backend immediately?
        // The user said "check the box before signing in". 
        // If they are already signed in, maybe they want to update it too.
        if (status === 'signed_in') {
            handleAction('update_standup', checked);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Attendance Status</h2>

                    <div className="mb-8">
                        {status === 'idle' && (
                            <div className="text-gray-600">You haven't signed in today.</div>
                        )}
                        {status === 'signed_in' && record && (
                            <div className="text-green-600 bg-green-50 p-4 rounded-lg inline-block">
                                <span className="font-semibold">Signed In</span> <br />
                                <span className="text-sm">{new Date(record.signInTime).toLocaleDateString()} {new Date(record.signInTime).toLocaleTimeString()}</span>
                            </div>
                        )}
                        {status === 'signed_out' && record && record.signOutTime && (
                            <div className="text-gray-600 bg-gray-50 p-4 rounded-lg inline-block">
                                <span className="font-semibold">Signed Out</span> <br />
                                <span className="text-sm">{new Date(record.signOutTime).toLocaleDateString()} {new Date(record.signOutTime).toLocaleTimeString()}</span>
                                <div className="text-sm mt-1 font-bold">Total hours: {
                                    (new Date(record.signOutTime).getTime() - new Date(record.signInTime).getTime()) / 36e5
                                }h</div>
                            </div>
                        )}

                    </div>

                    <div className="mb-8">
                        <label className="inline-flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={standupChecked}
                                onChange={handleCheckboxChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <span className="text-gray-700 font-medium">Daily Standup Attended</span>
                        </label>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => handleAction('signin')}
                            disabled={status === 'loading' || status === 'signed_in'}
                            className={`px-8 py-3 rounded-full font-semibold transition ${status === 'signed_in' || status === 'loading'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleAction('signout')}
                            disabled={status !== 'signed_in'}
                            className={`px-8 py-3 rounded-full font-semibold transition ${status === 'signed_in'
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
