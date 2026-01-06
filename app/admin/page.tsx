"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AttendanceRecord {
    _id: string;
    user: User;
    date: string;
    signInTime: string;
    signOutTime?: string;
    standup?: boolean;
}

interface MonthlyStats {
    [userId: string]: {
        name: string;
        totalHours: number;
    }
}

export default function AdminDashboardPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/admin/attendance');
            if (res.status === 403 || res.status === 401) {
                router.push('/login'); // Redirect to login if unauthorized
                return;
            }
            const data = await res.json();
            setRecords(data.records || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const groupRecords = (records: AttendanceRecord[]) => {
        const groups: any = {};

        records.forEach(record => {
            const date = new Date(record.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });
            // Calculate week number roughly or use a library. 
            // Simple approach: Week starting date
            const d = new Date(record.date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
            const weekStart = new Date(d.setDate(diff));
            const week = `Week of ${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })}`;
            const dayName = date.toLocaleDateString('default', { weekday: 'long' }); // Monday, Tuesday...

            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = {};
            if (!groups[year][month][week]) groups[year][month][week] = {};
            if (!groups[year][month][week][dayName]) groups[year][month][week][dayName] = [];

            groups[year][month][week][dayName].push(record);
        });

        return groups;
    };

    const calculateMonthlyHours = (records: AttendanceRecord[]) => {
        const stats: MonthlyStats = {};

        records.forEach(record => {
            if (record.signInTime && record.signOutTime && record.user) {
                const hours = (new Date(record.signOutTime).getTime() - new Date(record.signInTime).getTime()) / 36e5;

                if (!stats[record.user._id]) {
                    stats[record.user._id] = { name: record.user.name, totalHours: 0 };
                }
                stats[record.user._id].totalHours += hours;
            }
        });
        return stats;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const groupedRecords = groupRecords(records);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4">
                {Object.keys(groupedRecords).sort((a, b) => Number(b) - Number(a)).map(year => (
                    <div key={year} className="mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b pb-2">{year}</h2>
                        {Object.keys(groupedRecords[year]).map(month => {
                            // Filter records for this month for total calculation
                            const monthRecords = records.filter(r => {
                                const d = new Date(r.date);
                                return d.getFullYear() === Number(year) && d.toLocaleString('default', { month: 'long' }) === month;
                            });
                            const monthlyStats = calculateMonthlyHours(monthRecords);

                            return (
                                <div key={month} className="mb-10 ml-4">
                                    <h3 className="text-3xl font-semibold text-gray-700 mb-4">{month}</h3>

                                    {/* Monthly Stats Table */}
                                    <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                                        <h4 className="text-lg font-bold text-blue-800 mb-2">Monthly Summary (Total Hours)</h4>
                                        <ul>
                                            {Object.values(monthlyStats).map((stat: any) => (
                                                <li key={stat.name} className="flex justify-between w-64 text-blue-900">
                                                    <span>{stat.name}</span>
                                                    <span className="font-mono font-bold">{stat.totalHours.toFixed(2)} hrs</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {Object.keys(groupedRecords[year][month]).map(week => (
                                        <div key={week} className="mb-8 ml-4">
                                            <h4 className="text-2xl font-medium text-gray-600 mb-4">{week}</h4>
                                            {Object.keys(groupedRecords[year][month][week]).map(day => (
                                                <div key={day} className="mb-6 ml-4">
                                                    <h5 className="text-xl font-medium text-gray-500 mb-2">{day}</h5>
                                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Times</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standup</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {groupedRecords[year][month][week][day].map((record: AttendanceRecord) => (
                                                                    <tr key={record._id}>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm font-medium text-gray-900">{record.user?.name || 'Unknown'}</div>
                                                                            <div className="text-sm text-gray-500">{record.user?.email}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {record.date}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            In: {new Date(record.signInTime).toLocaleTimeString()}<br />
                                                                            Out: {record.signOutTime ? new Date(record.signOutTime).toLocaleTimeString() : '-'}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {record.standup ? (
                                                                                <span className="text-green-600 font-bold">Yes</span>
                                                                            ) : (
                                                                                <span className="text-red-400">No</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            {record.signOutTime ? (
                                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                                                                            ) : (
                                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Active</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </main>
        </div>
    );
}
