'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { toPng } from 'html-to-image';

interface QrCodeProps {
  reviewUrl: string;
}

export function QrCode({ reviewUrl }: QrCodeProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      toPng(qrCodeRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'review-qr-code.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Failed to generate QR code image', err);
        });
    }
  };

  return (
      <Card>
          <CardHeader>
              <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 border rounded-lg bg-white" ref={qrCodeRef}>
                   <QRCode value={reviewUrl} size={256} />
              </div>
              <Button onClick={downloadQRCode}>Download QR Code</Button>
          </CardContent>
      </Card>
    );
}
