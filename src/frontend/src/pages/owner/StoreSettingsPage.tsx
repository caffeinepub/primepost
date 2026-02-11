import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStore, useUpdateStore } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function StoreSettingsPage() {
  const { storeId } = useParams({ strict: false }) as { storeId: string };
  const navigate = useNavigate();
  const { data: store, isLoading } = useGetStore(storeId);
  const updateStoreMutation = useUpdateStore();

  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    location: '',
    mobileMoneyNumber: '',
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        category: store.category,
        location: store.location,
        mobileMoneyNumber: store.mobileMoneyNumber,
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStoreMutation.mutateAsync({
        id: storeId,
        ...formData,
      });
      toast.success('Store updated successfully!');
      navigate({ to: '/owner' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update store');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading store...</div>;
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Store not found</p>
          <Button onClick={() => navigate({ to: '/owner' })}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/owner' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Update your store information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Store ID</Label>
              <Input value={storeId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="nightclub">Nightclub</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileMoneyNumber">Mobile Money Number *</Label>
              <Input
                id="mobileMoneyNumber"
                value={formData.mobileMoneyNumber}
                onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateStoreMutation.isPending}>
              {updateStoreMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
