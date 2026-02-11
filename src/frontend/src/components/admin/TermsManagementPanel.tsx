import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetTermsContent, useSaveTermsContent } from '../../hooks/useQueries';
import { TermsType } from '../../backend';
import { toast } from 'sonner';
import { FileText, Save, Upload } from 'lucide-react';
import { CUSTOMER_TERMS, STORE_OWNER_TERMS, PRIVACY_POLICY } from '../../legal/providedLegalText';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TermsManagementPanel() {
  const { data: customerTerms, isLoading: loadingCustomer } = useGetTermsContent(TermsType.customerTerms);
  const { data: ownerTerms, isLoading: loadingOwner } = useGetTermsContent(TermsType.storeOwnerTerms);
  const { data: privacyPolicy, isLoading: loadingPrivacy } = useGetTermsContent(TermsType.privacyPolicy);
  const saveMutation = useSaveTermsContent();

  const [customerContent, setCustomerContent] = useState('');
  const [ownerContent, setOwnerContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');

  React.useEffect(() => {
    if (customerTerms) setCustomerContent(customerTerms);
  }, [customerTerms]);

  React.useEffect(() => {
    if (ownerTerms) setOwnerContent(ownerTerms);
  }, [ownerTerms]);

  React.useEffect(() => {
    if (privacyPolicy) setPrivacyContent(privacyPolicy);
  }, [privacyPolicy]);

  const handleSave = async (termsType: TermsType, content: string) => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    try {
      await saveMutation.mutateAsync({ termsType, content: content.trim() });
      toast.success('Content saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content');
    }
  };

  const handlePublishProvidedLegal = async () => {
    try {
      await saveMutation.mutateAsync({ termsType: TermsType.customerTerms, content: CUSTOMER_TERMS });
      await saveMutation.mutateAsync({ termsType: TermsType.storeOwnerTerms, content: STORE_OWNER_TERMS });
      await saveMutation.mutateAsync({ termsType: TermsType.privacyPolicy, content: PRIVACY_POLICY });
      toast.success('All legal documents published successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish legal documents');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Legal Documents Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage terms, conditions, and privacy policy
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Publish Provided Legal Docs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Publish Provided Legal Documents?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will publish the pre-written Customer Terms, Store Owner Terms, and Privacy Policy.
                  Any existing content will be replaced. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublishProvidedLegal}>
                  Publish All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">Customer Terms</TabsTrigger>
            <TabsTrigger value="owner">Store Owner Terms</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="customerTerms">Customer Terms & Conditions</Label>
              <Textarea
                id="customerTerms"
                value={customerContent}
                onChange={(e) => setCustomerContent(e.target.value)}
                placeholder="Enter customer terms and conditions..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => handleSave(TermsType.customerTerms, customerContent)}
              disabled={saveMutation.isPending || loadingCustomer}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Customer Terms'}
            </Button>
          </TabsContent>

          <TabsContent value="owner" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ownerTerms">Store Owner Terms & Conditions</Label>
              <Textarea
                id="ownerTerms"
                value={ownerContent}
                onChange={(e) => setOwnerContent(e.target.value)}
                placeholder="Enter store owner terms and conditions..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => handleSave(TermsType.storeOwnerTerms, ownerContent)}
              disabled={saveMutation.isPending || loadingOwner}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Store Owner Terms'}
            </Button>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="privacyPolicy">Privacy Policy</Label>
              <Textarea
                id="privacyPolicy"
                value={privacyContent}
                onChange={(e) => setPrivacyContent(e.target.value)}
                placeholder="Enter privacy policy..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => handleSave(TermsType.privacyPolicy, privacyContent)}
              disabled={saveMutation.isPending || loadingPrivacy}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Privacy Policy'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
