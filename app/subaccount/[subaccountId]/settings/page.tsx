'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Star, Bell, Link, Upload, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewLinkSharer } from '@/components/reviews/ReviewLinkSharer';

interface SubaccountSettings {
  businessName: string;
  businessType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  logoUrl?: string;
  googleReviewLink?: string;
  reviewThreshold: number;
  primaryColor: string;
  thankYouMessage?: string;
  timezone?: string;
  emailNotifications: boolean;
  enableReviews: boolean;
}

export default function SubaccountSettingsPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const [settings, setSettings] = useState<SubaccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for business information
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    logoUrl: '',
    website: '',
    phone: '',
    email: '',
  });
  
  // Form state for review settings
  const [reviewData, setReviewData] = useState({
    googleReviewLink: '',
    reviewThreshold: 4,
    autoApprovePositive: true,
    redirectToGoogle: true,
    collectNegativePrivately: true,
    requireCustomerName: false,
    thankYouMessage: '',
  });
  
  // Form state for notification settings
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    lowRatingAlerts: true,
    notificationEmail: '',
    notificationPhone: '',
  });

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`);
        if (response.ok) {
          const data = await response.json();
          const fetchedSettings = data.settings;
          setSettings(fetchedSettings);
          
          // Populate form data
          setBusinessData({
            businessName: fetchedSettings.businessName || '',
            businessType: fetchedSettings.businessType || '',
            address: fetchedSettings.address || '',
            city: fetchedSettings.city || '',
            state: fetchedSettings.state || '',
            zipCode: fetchedSettings.zipCode || '',
            country: fetchedSettings.country || 'US',
            logoUrl: fetchedSettings.logoUrl || '',
            website: '',
            phone: '',
            email: '',
          });
          
          setReviewData({
            googleReviewLink: fetchedSettings.googleReviewLink || '',
            reviewThreshold: fetchedSettings.reviewThreshold || 4,
            autoApprovePositive: true,
            redirectToGoogle: true,
            collectNegativePrivately: true,
            requireCustomerName: false,
            thankYouMessage: fetchedSettings.thankYouMessage || '',
          });
          
          setNotificationData({
            emailNotifications: fetchedSettings.emailNotifications !== false,
            smsNotifications: false,
            weeklyDigest: true,
            lowRatingAlerts: true,
            notificationEmail: '',
            notificationPhone: '',
          });
          
        } else {
          toast.error('Failed to load settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Error loading settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [params.subaccountId]);

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zipCode: businessData.zipCode,
          country: businessData.country,
          logoUrl: businessData.logoUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({ ...prev, ...result.settings } as SubaccountSettings));
        toast.success('Business information saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save business information');
      }
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error('Error saving business information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleReviewLink: reviewData.googleReviewLink,
          reviewThreshold: reviewData.reviewThreshold,
          thankYouMessage: reviewData.thankYouMessage,
          enableReviews: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({ ...prev, ...result.settings } as SubaccountSettings));
        toast.success('Review settings saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save review settings');
      }
    } catch (error) {
      console.error('Error saving review settings:', error);
      toast.error('Error saving review settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications: notificationData.emailNotifications,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({ ...prev, ...result.settings } as SubaccountSettings));
        toast.success('Notification settings saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save notification settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Error saving notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBusinessData(prev => ({ ...prev, logoUrl: dataUrl }));
      toast.success('Logo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and contact information
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      placeholder="Your Business Name"
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Industry</Label>
                    <Input
                      id="business-type"
                      placeholder="Restaurant, Healthcare, etc."
                      value={businessData.businessType}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessType: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address, city, state, zip code"
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={businessData.city}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={businessData.state}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      value={businessData.zipCode}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                      {businessData.logoUrl ? (
                        <img src={businessData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your business logo (PNG, JPG, SVG - max 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Business Information'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
