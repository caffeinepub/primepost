import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetMyOrders } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '../../utils/money';
import { Package } from 'lucide-react';
import { Variant_pending_completed_onTheWay_inProgress } from '../../backend';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetMyOrders();

  const activeOrders = orders.filter((o) => o.status !== Variant_pending_completed_onTheWay_inProgress.completed);
  const completedOrders = orders.filter((o) => o.status === Variant_pending_completed_onTheWay_inProgress.completed);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      inProgress: 'default',
      onTheWay: 'default',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace(/([A-Z])/g, ' $1').trim()}</Badge>;
  };

  const OrderList = ({ ordersList }: { ordersList: typeof orders }) => {
    if (ordersList.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            No orders found
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {ordersList.map((order) => (
          <Card
            key={order.id.toString()}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate({ to: `/customer/order/${order.id}` })}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.items.length} item(s) • Store: {order.storeId}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track your order history</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <OrderList ordersList={activeOrders} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <OrderList ordersList={completedOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
