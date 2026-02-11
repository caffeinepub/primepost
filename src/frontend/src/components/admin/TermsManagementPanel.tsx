import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetTermsContent, useSaveTermsContent } from '../../hooks/useQueries';
import { TermsType } from '../../backend';
import { toast } from 'sonner';
import { FileText, Save } from 'lucide-react';

export default function TermsManagementPanel() {
  const { data: customerTerms, isLoading: loadingCustomer } = useGetTermsContent(TermsType.customerTerms);
  const { data: ownerTerms, isLoading: loadingOwner } = useGetTermsContent(TermsType.storeOwnerTerms);
  const saveMutation = useSaveTermsContent();

  const [customerContent, setCustomerContent] = useState('');
  const [ownerContent, setOwnerContent] = useState('');

  React.useEffect(() => {
    if (customerTerms) setCustomerContent(customerTerms);
  }, [customerTerms]);

  React.useEffect(() => {
    if (ownerTerms) setOwnerContent(ownerTerms);
  }, [ownerTerms]);

  const handleSave = async (termsType: TermsType, content: string) => {
    if (!content.trim()) {
      toast.error('Terms content cannot be empty');
      return;
    }

    try {
      await saveMutation.mutateAsync({ termsType, content: content.trim() });
      toast.success('Terms saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save terms');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Terms & Conditions Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage terms for customers and store owners
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Customer Terms</TabsTrigger>
            <TabsTrigger value="owner">Store Owner Terms</TabsTrigger>
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
