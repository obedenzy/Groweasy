'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewLinkSharerProps {
    subaccountId: string;
}

export function ReviewLinkSharer({ subaccountId }: ReviewLinkSharerProps) {
    const [reviewLink, setReviewLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const origin = window.location.origin;
            setReviewLink(`${origin}/reviews/${subaccountId}`);
        }
    }, [subaccountId]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleDownloadQrCode = () => {
        if (!reviewLink) return;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reviewLink}`;
        window.open(qrCodeUrl, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Review Collection Links</CardTitle>
                <CardDescription>
                    Share these links to collect reviews from customers
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Customer Review URL</Label>
                        <div className="flex space-x-2">
                            <Input
                                readOnly
                                value={reviewLink}
                                className="bg-muted"
                                placeholder="Loading..."
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(reviewLink)}
                                disabled={!reviewLink}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is the link you can share with your customers to collect reviews.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>QR Code</Label>
                        <div className="flex items-center space-x-4">
                            <div className="w-32 h-32 bg-muted border rounded-lg flex items-center justify-center">
                                {reviewLink ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reviewLink}`} alt="Review QR Code" />
                                ) : (
                                    <div className="text-xs text-muted-foreground">Loading...</div>
                                )}
                            </div>
                            <div>
                                <Button type="button" variant="outline" size="sm" onClick={handleDownloadQrCode} disabled={!reviewLink}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download QR Code
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Print this QR code for in-store use
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
