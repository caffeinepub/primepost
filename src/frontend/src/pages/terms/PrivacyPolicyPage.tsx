import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetTermsContent } from '../../hooks/useQueries';
import { TermsType } from '../../backend';
import { AlertCircle, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { data: privacyContent, isLoading } = useGetTermsContent(TermsType.privacyPolicy);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                How we collect, use, and protect your information
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!privacyContent ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Privacy Policy is not yet available. Please contact the administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {privacyContent}
              </div>
            </ScrollArea>
          )}
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
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
