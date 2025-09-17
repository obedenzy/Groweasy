'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCode as ReactQRCode } from "qrcode.react";

interface QrCodeProps {
  reviewUrl: string;
}

export function QrCode({ reviewUrl }: QrCodeProps) {

  const downloadQRCode = () => {
    const qrCodeCanvas = document.querySelector("canvas");
    if (qrCodeCanvas) {
      const pngUrl = qrCodeCanvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "review-qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 border rounded-lg">
                 <ReactQRCode value={reviewUrl} size={256} />
            </div>
            <Button onClick={downloadQRCode}>Download QR Code</Button>
        </CardContent>
    </Card>
  );
}
