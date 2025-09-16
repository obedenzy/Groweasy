'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

interface ReviewLinkSharerProps {
    subaccountId: string;
}

export function ReviewLinkSharer({ subaccountId }: ReviewLinkSharerProps) {
    const [reviewUrl, setReviewUrl] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const fetchSubaccountSlug = async () => {
            if (!subaccountId) return;

            try {
                const { data, error } = await supabase
                    .from('subaccounts')
                    .select('slug')
                    .eq('id', subaccountId)
                    .single();

                if (error) {
                    throw error;
                }

                if (data && data.slug) {
                    const origin = window.location.origin;
                    const url = `${origin}/reviews/${data.slug}`;
                    setReviewUrl(url);
                    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`);
                }
            } catch (error) {
                console.error('Error fetching subaccount slug:', error);
                toast.error('Could not generate the review link.');
            }
        };

        fetchSubaccountSlug();
    }, [subaccountId]);

    const copyToClipboard = () => {
        if (!reviewUrl) return;
        navigator.clipboard.writeText(reviewUrl);
        toast.success('Review link copied to clipboard');
    };

    const handleDownloadQrCode = () => {
        if (!qrCodeUrl) return;
        window.open(qrCodeUrl.replace('size=150x150', 'size=500x500'), '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Share Your Review Link</CardTitle>
                <CardDescription>
                    Share this link with your customers to start collecting reviews.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Customer Review URL</Label>
                    <div className="flex space-x-2">
                        <Input
                            readOnly
                            value={reviewUrl || 'Loading...'}
                            className="bg-muted"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            disabled={!reviewUrl}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex items-center space-x-4">
                        <div className="w-32 h-32 bg-muted border rounded-lg flex items-center justify-center p-2">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="Review QR Code" />
                            ) : (
                                <div className="text-xs text-muted-foreground">Loading...</div>
                            )}
                        </div>
                        <div>
                            <Button type="button" variant="outline" onClick={handleDownloadQrCode} disabled={!qrCodeUrl}>
                                <Download className="h-4 w-4 mr-2" />
                                Download QR Code
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Print and display this QR code for customers.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
