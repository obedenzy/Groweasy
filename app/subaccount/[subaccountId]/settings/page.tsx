'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/spinner';
import { ReviewPreview } from '@/components/review-preview';

// Interface to allow for null values from the database.
interface SettingsData {
  businessName: string;
  logoUrl: string | null;
  reviewUrl?: string;
  businessType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  enable_reviews: boolean | null;
  googleReviewLink?: string | null;
  reviewThreshold: number | null;
  thankYouMessage?: string | null;
}

export default function SubaccountSettingsPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        } else {
          toast.error('Failed to load settings.');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('An unexpected error occurred.');
      }
    };
    fetchSettings();
  }, [params.subaccountId]);

  const handleInputChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => {
      // Initialize with default structure if prev is null
      const newSettings = prev ? { ...prev } : {
        businessName: '',
        logoUrl: null,
        enable_reviews: true,
        reviewThreshold: 4,
      };
      (newSettings as any)[field] = value;
      return newSettings;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          // Ensure values sent to the backend are not null, using defaults.
          enable_reviews: settings.enable_reviews ?? true,
          reviewThreshold: settings.reviewThreshold ?? 4,
        }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // The main loading spinner has been removed to provide an instant-loading experience.

  return (
    <div className="space-y-4">
        <div className="flex items-start justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
            <p className="text-muted-foreground">
                Manage settings and see a live preview of your review page.
            </p>
            </div>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Forms */}
            <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your public-facing business details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" value={settings?.businessName || ''} onChange={(e) => handleInputChange('businessName', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Business Logo</Label>
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                        {settings?.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Building className="h-8 w-8 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => handleInputChange('logoUrl', reader.result as string); reader.readAsDataURL(file); }} className="mb-2" />
                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 2MB.</p>
                        </div>
                    </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Review Settings</CardTitle>
                <CardDescription>Configure the review collection process.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="enable_reviews" className="flex flex-col space-y-1 cursor-pointer">
                    <span>Enable Review Page</span>
                    <span className="font-normal leading-snug text-muted-foreground">Activates the public review landing page.</span>
                    </Label>
                    <Switch id="enable_reviews" checked={settings?.enable_reviews ?? true} onCheckedChange={(checked) => handleInputChange('enable_reviews', checked)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="googleReviewLink">Google Review Link</Label>
                    <Input id="googleReviewLink" placeholder="https://g.page/r/YourBiz/review" value={settings?.googleReviewLink || ''} onChange={(e) => handleInputChange('googleReviewLink', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reviewThreshold">Positive Review Threshold (1-5)</Label>
                    <Input id="reviewThreshold" type="number" min="1" max="5" value={settings?.reviewThreshold ?? 4} onChange={(e) => handleInputChange('reviewThreshold', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="thankYouMessage">Internal Feedback Message</Label>
                    <Textarea id="thankYouMessage" placeholder="Thank you for your valuable feedback!" value={settings?.thankYouMessage || ''} onChange={(e) => handleInputChange('thankYouMessage', e.target.value)} />
                </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <><LoadingSpinner className="mr-2 h-4 w-4" /> Saving...</> : 'Save All Settings'}
                </Button>
            </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="space-y-4">
            <ReviewPreview settings={settings} subaccountId={params.subaccountId} />
            </div>
        </form>
    </div>
  );
}
