'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // This effect will run when the user's authentication status changes.
  // It handles the redirect AFTER the session is confirmed.
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      toast.success('Redirecting to your dashboard...');
      const { user } = session;
      let targetUrl = '/dashboard'; // A sensible default

      if (user.role === 'AGENCY_ADMIN' && user.agencyId) {
        targetUrl = `/agency/${user.agencyId}/dashboard`;
      } else if (user.role === 'SUBACCOUNT_USER' && user.subaccountId) {
        targetUrl = `/subaccount/${user.subaccountId}/dashboard`;
      }
      
      // Use router.replace for a clean navigation history
      router.replace(targetUrl);
    }
  }, [status, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false, // Important: We handle the redirect manually in the useEffect
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // This will be true for invalid credentials
        toast.error('Login failed. Please check your credentials.');
        setIsLoading(false);
      }
      
      // If signIn is successful, the `useSession` hook will update,
      // and the useEffect will handle the redirect. We don't need to do anything here.
      if(result?.ok) {
        toast.success('Login successful!');
        // setIsLoading will be handled by the redirect or if an error occurs
      }

    } catch (error) {
      console.error('Login submission error:', error);
      toast.error('An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };
  
  // Prevent logged-in users from seeing the login form
  if (status === 'authenticated') {
      return (
        <div className="flex items-center justify-center min-h-screen">
            <p>You are already logged in. Redirecting...</p>
        </div>
      );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register("email")}
              type="email"
              placeholder="Enter your email address"
              className="h-11"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className="h-11"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isLoading || status === 'loading'}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrap the component in Suspense to allow use of useSearchParams
export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
