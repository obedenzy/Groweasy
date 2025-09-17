'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';

interface SubaccountData {
  id: string;
  businessName: string;
  logoUrl: string | null;
  isActive: boolean;
  googleReviewLink?: string | null;
  reviewThreshold: number;
  thankYouMessage?: string | null;
}

interface ReviewFormProps {
  subaccountData: SubaccountData;
  isPreview?: boolean; // New prop for preview mode
}

export function ReviewForm({ subaccountData, isPreview = false }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [step, setStep] = useState('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPositiveReview = rating >= subaccountData.reviewThreshold;

  const handleRatingSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    if (isPositiveReview && subaccountData.googleReviewLink) {
        if (isPreview) {
            toast.info('Positive reviews would be redirected to Google.');
        } else {
            window.location.href = subaccountData.googleReviewLink;
        }
    } else {
      setStep('feedback');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
        toast.info('This is a preview. The form cannot be submitted.');
        return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${subaccountData.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, subject, comment, customerName, customerEmail }),
        }
      );

      if (response.ok) {
        setStep('thankyou');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          {subaccountData.logoUrl && <img src={subaccountData.logoUrl} alt="Logo" className="mx-auto h-16 w-auto mb-4" />}
          <CardTitle className="text-2xl">{subaccountData.businessName}</CardTitle>
          <CardDescription>Share your experience with us</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'rating' && (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">How would you rate your experience?</h3>
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-10 w-10 cursor-pointer ${ (hoverRating >= star || rating >= star) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <Button onClick={handleRatingSubmit} disabled={rating === 0}>Submit Rating</Button>
            </div>
          )}

          {step === 'feedback' && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <h3 className="text-lg font-medium text-center">Please share more details</h3>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Service Experience" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comments</Label>
                <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your detailed feedback is valuable to us..." required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Your Name</Label>
                    <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Your Email</Label>
                    <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <><LoadingSpinner className="mr-2 h-4 w-4" />Submitting...</> : 'Submit Feedback'}
              </Button>
            </form>
          )}

          {step === 'thankyou' && (
            <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-gray-600">{subaccountData.thankYouMessage || 'We appreciate your feedback.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
