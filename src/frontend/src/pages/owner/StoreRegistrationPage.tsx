import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateStore } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Store } from 'lucide-react';

export default function StoreRegistrationPage() {
  const navigate = useNavigate();
  const createStoreMutation = useCreateStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    location: '',
    mobileMoneyNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.mobileMoneyNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const storeId = await createStoreMutation.mutateAsync(formData);
      toast.success(`Store registered successfully! Store ID: ${storeId}`);
      navigate({ to: '/owner' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to register store');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Register New Store</CardTitle>
          <CardDescription>Create your store and get a unique Store ID</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter store name"
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
                placeholder="Enter location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileMoneyNumber">Mobile Money Number *</Label>
              <Input
                id="mobileMoneyNumber"
                value={formData.mobileMoneyNumber}
                onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                placeholder="Enter mobile money number"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={createStoreMutation.isPending}>
                {createStoreMutation.isPending ? 'Registering...' : 'Register Store'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/owner' })}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
