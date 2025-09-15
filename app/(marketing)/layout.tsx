import { Star } from 'lucide-react';
import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Review Master
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <button className="text-gray-600 hover:text-gray-900">Sign In</button>
              </Link>
              <Link href="/auth/register">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}