'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ReviewLinkSharerProps {
  reviewUrl: string;
}

export function ReviewLinkSharer({ reviewUrl }: ReviewLinkSharerProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (!reviewUrl) {
      toast.error('Review link is not available yet.');
      return;
    }
    navigator.clipboard.writeText(reviewUrl);
    setHasCopied(true);
    toast.success('Review link copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Share Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Review Link</DialogTitle>
          <DialogDescription>
            Share this link with your customers to start collecting reviews.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={reviewUrl || 'Generating link...'} readOnly />
          </div>
          <Button onClick={handleCopy} size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
