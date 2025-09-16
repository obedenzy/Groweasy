'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building, Upload } from 'lucide-react';
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
  thankYouMessage?: string;
  enableReviews: boolean;
  reviewUrl: string;
}

export default function SubaccountSettingsPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const [settings, setSettings] = useState<SubaccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    logoUrl: '',
  });
  
  const [reviewData, setReviewData] = useState({
    googleReviewLink: '',
    reviewThreshold: 4,
    thankYouMessage: '',
    enableReviews: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`);
        if (response.ok) {
          const data = await response.json();
          const fetchedSettings = data.settings;
          setSettings(fetchedSettings);
          
          setBusinessData({
            businessName: fetchedSettings.businessName || '',
            businessType: fetchedSettings.businessType || '',
            address: fetchedSettings.address || '',
            city: fetchedSettings.city || '',
            state: fetchedSettings.state || '',
            zipCode: fetchedSettings.zipCode || '',
            country: fetchedSettings.country || 'US',
            logoUrl: fetchedSettings.logoUrl || '',
          });
          
          setReviewData({
            googleReviewLink: fetchedSettings.googleReviewLink || '',
            reviewThreshold: fetchedSettings.reviewThreshold || 4,
            thankYouMessage: fetchedSettings.thankYouMessage || '',
            enableReviews: fetchedSettings.enableReviews !== false,
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
        body: JSON.stringify(businessData),
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
        body: JSON.stringify(reviewData),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground">
            Manage your business profile and review collection settings.
          </p>
        </div>
        <ReviewLinkSharer subaccountId={params.subaccountId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input id="business-name" value={businessData.businessName} onChange={(e) => setBusinessData(prev => ({...prev, businessName: e.target.value}))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Industry</Label>
                    <Input id="business-type" value={businessData.businessType} onChange={(e) => setBusinessData(prev => ({...prev, businessType: e.target.value}))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea id="address" value={businessData.address} onChange={(e) => setBusinessData(prev => ({...prev, address: e.target.value}))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={businessData.city} onChange={(e) => setBusinessData(prev => ({...prev, city: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={businessData.state} onChange={(e) => setBusinessData(prev => ({...prev, state: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" value={businessData.zipCode} onChange={(e) => setBusinessData(prev => ({...prev, zipCode: e.target.value}))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                      {businessData.logoUrl ? (
                        <img src={businessData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} className="mb-2" />
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG - max 2MB</p>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Business Info'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Settings</CardTitle>
              <CardDescription>Configure how you collect and manage reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="enable-reviews" className="flex flex-col space-y-1">
                    <span>Enable Review Collection</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Activate the public-facing review landing page.
                    </span>
                  </Label>
                  <Switch
                    id="enable-reviews"
                    checked={reviewData.enableReviews}
                    onCheckedChange={(checked) => setReviewData(prev => ({ ...prev, enableReviews: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-review-link">Google Review Link</Label>
                  <Input id="google-review-link" placeholder="https://g.page/r/YourBiz/review" value={reviewData.googleReviewLink} onChange={(e) => setReviewData(prev => ({...prev, googleReviewLink: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-threshold">Positive Review Threshold</Label>
                  <Input id="review-threshold" type="number" min="1" max="5" value={reviewData.reviewThreshold} onChange={(e) => setReviewData(prev => ({...prev, reviewThreshold: parseInt(e.target.value)}))} />
                  <p className="text-xs text-muted-foreground">Ratings at or above this value will be considered positive (1-5).</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thank-you-message">Thank You Message</Label>
                  <Textarea id="thank-you-message" placeholder="Thank you for your valuable feedback!" value={reviewData.thankYouMessage} onChange={(e) => setReviewData(prev => ({...prev, thankYouMessage: e.target.value}))} />
                  <p className="text-xs text-muted-foreground">Message shown to customers after they submit internal feedback.</p>
                </div>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Review Settings'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
