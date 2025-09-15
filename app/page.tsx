'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // The middleware is now the single source of truth for redirects.
  // This useEffect is no longer needed and was causing the redirect loop.
  /*
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);
  */

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If the session is authenticated, the middleware will have already redirected
  // to the appropriate dashboard. This content is for unauthenticated users.
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="text-2xl font-bold">Grow Easy</div>
        <nav className="flex items-center space-x-4">
          <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          <Button asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="text-center py-20 bg-gray-50">
          <h1 className="text-5xl font-bold mb-4">The Future of Review Management is Here</h1>
          <p className="text-xl text-gray-600 mb-8">Harness the power of AI to automate review collection, analysis, and response.</p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Start Your Free Trial</Link>
          </Button>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why You'll Love Grow Easy</h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">AI-Powered Responses</h3>
              <p>Automatically generate context-aware, human-like responses to reviews.</p>
            </div>
            {/* Feature 2 */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">Centralized Dashboard</h3>
              <p>Manage reviews from all your platforms in one simple, intuitive dashboard.</p>
            </div>
            {/* Feature 3 */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">Actionable Insights</h3>
              <p>Gain valuable insights from review sentiment and trend analysis.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t text-center text-gray-600">
        &copy; {new Date().getFullYear()} Grow Easy. All rights reserved.
      </footer>
    </div>
  );
}
