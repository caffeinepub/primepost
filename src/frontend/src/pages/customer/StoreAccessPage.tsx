import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Store } from 'lucide-react';

export default function StoreAccessPage() {
  const [storeId, setStoreId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeId.trim()) {
      navigate({ to: `/customer/store/${storeId.trim()}` });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Access Store</CardTitle>
          <CardDescription>Enter a Store ID to browse products and place orders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeId">Store ID</Label>
              <Input
                id="storeId"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="Enter Store ID"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={!storeId.trim()}>
              Access Store
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
