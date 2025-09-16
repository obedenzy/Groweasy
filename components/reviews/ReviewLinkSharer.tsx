'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Copy, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReviewLinkSharerProps {
  slug: string; // The component now directly accepts the subaccount slug
}

export function ReviewLinkSharer({ slug }: ReviewLinkSharerProps) {
  const [isCopied, setIsCopied] = useState(false);

  // If the slug isn't available yet, don't render the component
  if (!slug) {
    return null;
  }

  // Construct the full URL on the client side
  const reviewUrl = `${window.location.origin}/reviews/${slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reviewUrl).then(() => {
      setIsCopied(true);
      toast.success('Review link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Link
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium">Share this link with your customers to collect reviews.</p>
          <div className="flex items-center space-x-2">
            <Input value={reviewUrl} readOnly className="flex-1 h-9" />
            <Button size="icon" onClick={copyToClipboard} className="h-9 w-9">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
