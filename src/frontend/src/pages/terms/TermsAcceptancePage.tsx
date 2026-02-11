import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetTermsContent, useAcceptTerms } from '../../hooks/useQueries';
import { TermsType } from '../../backend';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { CUSTOMER_TERMS, STORE_OWNER_TERMS } from '../../legal/providedLegalText';

interface TermsAcceptancePageProps {
  termsType: TermsType;
}

export default function TermsAcceptancePage({ termsType }: TermsAcceptancePageProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const { data: backendTermsContent, isLoading } = useGetTermsContent(termsType);
  const acceptMutation = useAcceptTerms();

  const isCustomerTerms = termsType === TermsType.customerTerms;
  const title = isCustomerTerms ? 'Customer Terms & Conditions' : 'Store Owner Terms & Conditions';
  const redirectPath = isCustomerTerms ? '/customer' : '/owner';

  // Always use fallback if backend content is null or empty
  const termsContent = (backendTermsContent && backendTermsContent.trim()) 
    ? backendTermsContent 
    : (isCustomerTerms ? CUSTOMER_TERMS : STORE_OWNER_TERMS);

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync({ termsType });
      toast.success('Terms accepted successfully!');
      navigate({ to: redirectPath });
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept terms');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading terms...</p>
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
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Please review and accept to continue
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {termsContent}
            </div>
          </ScrollArea>
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer">
              I have read and accept the {title}
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAccept}
            className="w-full"
            disabled={!accepted || acceptMutation.isPending}
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept and Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
