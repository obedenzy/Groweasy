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
import { ReviewLinkSharer } from '@/components/reviews/ReviewLinkSharer';

// A single, unified interface for all settings
interface SubaccountSettings {
  name: string;
  logo: string;
  slug: string;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  google_review_link?: string;
  review_threshold: number;
  thank_you_message?: string;
  is_active: boolean;
}

export default function SubaccountSettingsPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const [settings, setSettings] = useState<SubaccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`);
        if (response.ok) {
          const data = await response.json();
          // The API now returns a single, flat object
          setSettings(data);
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

  const handleInputChange = (field: keyof SubaccountSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  // A single save handler for all settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !settings.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/subaccounts/${params.subaccountId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const result = await response.json();
        // Update state with the potentially updated settings from the server
        if(result.settings) {
          setSettings(result.settings);
        }
        toast.success('Settings saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-6"> 
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
                <div className="h-80 bg-gray-200 rounded"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground">
            Manage your business profile and review collection settings.
          </p>
        </div>
        {/* Pass the correct slug to the sharer component */}
        <ReviewLinkSharer slug={settings.slug} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" value={settings.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                      {settings.logo ? (
                        <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Settings</CardTitle>
              <CardDescription>Configure how you collect and manage reviews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="is_active" className="flex flex-col space-y-1">
                  <span>Enable Review Collection</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Activate the public-facing review landing page.
                  </span>
                </Label>
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_review_link">Google Review Link</Label>
                <Input id="google_review_link" placeholder="https://g.page/r/YourBiz/review" value={settings.google_review_link || ''} onChange={(e) => handleInputChange('google_review_link', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_threshold">Positive Review Threshold (1-5)</Label>
                <Input id="review_threshold" type="number" min="1" max="5" value={settings.review_threshold} onChange={(e) => handleInputChange('review_threshold', parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thank_you_message">Thank You Message</Label>
                <Textarea id="thank_you_message" placeholder="Thank you for your valuable feedback!" value={settings.thank_you_message || ''} onChange={(e) => handleInputChange('thank_you_message', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
       <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save All Settings'}</Button>
      </div>
    </form>
  );
}
