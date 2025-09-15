'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const registrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  businessName: z.string().min(1, "Business name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
    },
  });

  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          subaccountName: data.businessName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Redirecting to login...');
        router.push('/auth/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        <div className="hidden md:flex items-center justify-center bg-gray-100">
          <div className="p-8 text-center">
            <img src="/placeholder.svg" alt="Review Management" className="w-3/4 mx-auto mb-8"/>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Grow Easy</h1>
            <p className="text-gray-600">
              The all-in-one platform for managing your business reviews with the power of AI.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Start your journey with us today</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    {...register("fullName")}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email address"
                    className="h-11"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Create a strong password"
                    className="h-11"
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="Confirm your password"
                    className="h-11"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    {...register("businessName")}
                    placeholder="Enter your business name"
                    className="h-11"
                  />
                  {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
