import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ApkDownloadPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <img 
            src="/assets/generated/primepost-logo.dim_512x512.png" 
            alt="PrimePost" 
            className="w-24 h-24 mx-auto mb-4" 
          />
          <CardTitle className="text-3xl">Download PrimePost for Android</CardTitle>
          <CardDescription className="text-base">
            Get the PrimePost mobile app and enjoy seamless ordering on the go
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <a 
              href="/assets/primepost.apk" 
              download="primepost.apk"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg text-lg"
            >
              <Download className="w-6 h-6" />
              Download APK
            </a>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Installation Instructions</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 1: Enable Unknown Sources</p>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → Security → Enable "Install from Unknown Sources"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 2: Download the APK</p>
                  <p className="text-sm text-muted-foreground">
                    Click the download button above to save the APK file
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 3: Install the App</p>
                  <p className="text-sm text-muted-foreground">
                    Open the downloaded APK file and follow the installation prompts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 4: Launch PrimePost</p>
                  <p className="text-sm text-muted-foreground">
                    Open the app and sign in to start ordering
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact us at PrimePost7@gmail.com</p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
