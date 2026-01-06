import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-8">Attendance System</h1>
      <p className="text-xl mb-12">Manage your attendance efficiently.</p>

      <div className="flex gap-4">
        <Link href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
          Log In
        </Link>
        <Link href="/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition shadow-lg">
          Register
        </Link>
      </div>
    </main>
  );
}
