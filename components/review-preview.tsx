'use client';

import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode } from '@/components/reviews/QrCode';

interface SettingsData {
  businessName: string;
  logoUrl: string | null;
  reviewUrl?: string;
  enable_reviews: boolean | null;
  googleReviewLink?: string | null;
  reviewThreshold: number | null;
  thankYouMessage?: string | null;
}

interface ReviewPreviewProps {
  settings: SettingsData | null;
  subaccountId: string;
}

export function ReviewPreview({ settings, subaccountId }: ReviewPreviewProps) {
  const reviewUrl = `https://app.carepulse.co/reviews/${subaccountId}`;

  const subaccountData = {
    id: subaccountId,
    businessName: settings?.businessName || 'Your Business Name',
    logoUrl: settings?.logoUrl || null,
    isActive: settings?.enable_reviews ?? true,
    googleReviewLink: settings?.googleReviewLink || undefined,
    reviewThreshold: settings?.reviewThreshold ?? 4,
    thankYouMessage: settings?.thankYouMessage || undefined,
  };

  if (subaccountData.isActive === false) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
            <div className="text-center p-8 bg-white shadow-md rounded-lg">
              <h1 className="text-2xl font-bold mb-4">Reviews Unavailable</h1>
              <p className="text-gray-600">
                The review page is currently disabled. Enable it in the settings to see the preview.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="review-form" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review-form">Review Form</TabsTrigger>
            <TabsTrigger value="public-url">Public URL</TabsTrigger>
            <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="review-form">
            <div className="p-4 border rounded-lg bg-gray-50 mt-4">
              <ReviewForm subaccountData={subaccountData} isPreview={true} />
            </div>
          </TabsContent>
          <TabsContent value="public-url">
            <div className="p-4 border rounded-lg bg-gray-50 mt-4">
                <p className="text-sm text-muted-foreground">Your public review URL is:</p>
                <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {reviewUrl}
                </a>
            </div>
          </TabsContent>
          <TabsContent value="qr-code">
             <QrCode reviewUrl={reviewUrl} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
