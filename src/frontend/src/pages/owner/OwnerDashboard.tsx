import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetMyStores } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus, Settings, Package, ShoppingBag } from 'lucide-react';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { data: stores = [], isLoading } = useGetMyStores();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Store Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your stores and inventory</p>
        </div>
        <Button onClick={() => navigate({ to: '/owner/register-store' })}>
          <Plus className="h-4 w-4 mr-2" />
          Register New Store
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading stores...</div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">You haven't registered any stores yet</p>
            <Button onClick={() => navigate({ to: '/owner/register-store' })}>
              <Plus className="h-4 w-4 mr-2" />
              Register Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{store.name}</CardTitle>
                <CardDescription>
                  <span className="capitalize">{store.category}</span> • {store.location}
                </CardDescription>
                <div className="text-xs text-muted-foreground mt-2">
                  Store ID: {store.id}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/owner/store/${store.id}/inventory` })}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/owner/store/${store.id}/orders` })}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/owner/store/${store.id}/settings` })}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Store Settings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
