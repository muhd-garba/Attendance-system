import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Attendance System',
  description: 'Simple Attendance Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-50 min-h-screen"}>{children}</body>
    </html>
  );
}
