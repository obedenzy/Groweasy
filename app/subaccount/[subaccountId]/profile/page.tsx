'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
  image: z.any().optional(),
});

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const canEdit = !userId || session?.user?.id === userId || session?.user?.role === 'SUBACCOUNT_ADMIN';

  useEffect(() => {
    async function fetchUserProfile() {
      if (userId) {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const user = await response.json();
          setUserProfile(user);
        } else {
          toast({ title: 'Error', description: 'Could not fetch user profile.', variant: 'destructive' });
        }
      }
    }

    if (userId !== session?.user?.id) {
        fetchUserProfile();
    } else {
        setUserProfile(session?.user);
    }
  }, [userId, session?.user, toast]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const currentUser = userId ? userProfile : session?.user;
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [userProfile, session?.user, userId, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.password) {
        formData.append('password', values.password);
    }
    if (values.image && values.image[0]) {
        formData.append('image', values.image[0]);
    }

    const targetUserId = userId || session?.user?.id;

    try {
      const response = await fetch(`/api/profile?userId=${targetUserId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        if (session?.user?.id === targetUserId) {
            await update({ ...session, user: { ...session.user, ...updatedUser } });
        }
        setUserProfile(updatedUser);
        toast({ title: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast({ title: 'Error updating profile', description: errorData.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'An unexpected error occurred', description: 'Please try again later.', variant: 'destructive' });
    }
  }

  const currentUser = userId ? userProfile : session?.user;

  if (!currentUser) {
      return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser?.image || '/avatars/01.png'} alt={currentUser?.name || 'User'} />
                  <AvatarFallback>{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label htmlFor="image-upload" className="absolute bottom-0 right-0 flex items-center justify-center h-8 w-8 bg-primary rounded-full cursor-pointer text-white">
                    <Upload size={16} />
                    <input id="image-upload" type="file" className="hidden" {...form.register('image')} />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                <p className="text-muted-foreground">{currentUser?.email}</p>
              </div>
            </div>
            <div className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        You cannot change your email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEditing && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="New password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep your current password.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </CardContent>
          {canEdit && (
            <CardFooter className="border-t px-6 py-4">
              <div className="flex justify-end gap-2 w-full">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardFooter>
          )}
        </Card>
      </form>
    </Form>
  );
}
