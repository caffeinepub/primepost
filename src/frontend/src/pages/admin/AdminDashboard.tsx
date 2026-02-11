import React, { useState } from 'react';
import { useGetAllStores, useGetAllCustomers, useGetAllOrders, useBlockStore, useUnblockStore } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '../../utils/money';
import { aggregateOrdersByDay, aggregateByWeek, aggregateByMonth } from '../../utils/analytics';
import TermsManagementPanel from '../../components/admin/TermsManagementPanel';
import { toast } from 'sonner';
import { Store, Users, ShoppingBag, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stores = [] } = useGetAllStores();
  const { data: customers = [] } = useGetAllCustomers();
  const { data: orders = [] } = useGetAllOrders();
  const blockStoreMutation = useBlockStore();
  const unblockStoreMutation = useUnblockStore();

  const [analyticsView, setAnalyticsView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const commissionRate = 0.1;

  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = order.items.reduce((itemSum, [_, qty]) => itemSum + (100n * qty), 0n);
    return sum + orderTotal;
  }, 0n);

  const handleToggleBlock = async (storeId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockStoreMutation.mutateAsync(storeId);
        toast.success('Store unblocked successfully');
      } else {
        await blockStoreMutation.mutateAsync(storeId);
        toast.success('Store blocked successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update store status');
    }
  };

  const productPriceMap = new Map<string, bigint>();
  const dailyStats = aggregateOrdersByDay(orders, productPriceMap);
  const weeklyStats = aggregateByWeek(dailyStats);
  const monthlyStats = aggregateByMonth(dailyStats);

  const statsToShow = analyticsView === 'daily' ? dailyStats : analyticsView === 'weekly' ? weeklyStats : monthlyStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the entire platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commission: {formatPrice(BigInt(Math.floor(Number(totalRevenue) * commissionRate)))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stores">
        <TabsList>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Stores</CardTitle>
            </CardHeader>
            <CardContent>
              {stores.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No stores registered</div>
              ) : (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="capitalize">{store.category}</span> • {store.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {store.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {store.isBlocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={store.isBlocked ? 'default' : 'destructive'}
                          onClick={() => handleToggleBlock(store.id, store.isBlocked)}
                        >
                          {store.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No orders yet</div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 20).map((order) => (
                    <div key={order.id.toString()} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.toString()}</h3>
                        <p className="text-sm text-muted-foreground">
                          Store: {order.storeId} • {order.items.length} item(s)
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analytics</CardTitle>
                <Select value={analyticsView} onValueChange={(v) => setAnalyticsView(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {statsToShow.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No data available</div>
              ) : (
                <div className="space-y-2">
                  {statsToShow.slice(-10).map((stat) => (
                    <div key={stat.date} className="flex items-center justify-between text-sm pb-2 border-b">
                      <span>{stat.date}</span>
                      <div className="flex items-center gap-4">
                        <span>{stat.orderCount} orders</span>
                        <span className="font-semibold">{formatPrice(stat.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <TermsManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
