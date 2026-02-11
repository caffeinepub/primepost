import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStoreOrders, useUpdateOrderStatus } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Bell } from 'lucide-react';
import { Variant_pending_completed_onTheWay_inProgress } from '../../backend';

export default function OrdersManagementPage() {
  const { storeId } = useParams({ strict: false }) as { storeId: string };
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetStoreOrders(storeId);
  const updateStatusMutation = useUpdateOrderStatus();

  const pendingOrders = orders.filter((o) => o.status === Variant_pending_completed_onTheWay_inProgress.pending);
  const inProgressOrders = orders.filter((o) => o.status === Variant_pending_completed_onTheWay_inProgress.inProgress);
  const completedOrders = orders.filter((o) => o.status === Variant_pending_completed_onTheWay_inProgress.completed);

  const handleStatusChange = async (orderId: bigint, newStatus: Variant_pending_completed_onTheWay_inProgress) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, storeId, status: newStatus });
      toast.success('Order status updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const OrderCard = ({ order }: { order: typeof orders[0] }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.items.length} item(s)
              {order.tableNumber && ` • Table ${order.tableNumber.toString()}`}
            </p>
            {order.specialNote && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                Note: {order.specialNote}
              </p>
            )}
          </div>
          <Badge>{order.paymentMethod}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          {order.items.map(([productId, qty], idx) => (
            <div key={idx} className="text-sm flex justify-between">
              <span>{productId}</span>
              <span>x{qty.toString()}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          {order.status === Variant_pending_completed_onTheWay_inProgress.pending && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange(order.id, Variant_pending_completed_onTheWay_inProgress.inProgress)}
            >
              Accept Order
            </Button>
          )}
          {order.status === Variant_pending_completed_onTheWay_inProgress.inProgress && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange(order.id, Variant_pending_completed_onTheWay_inProgress.completed)}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/owner' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        {pendingOrders.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {pendingOrders.length} New Order{pendingOrders.length !== 1 && 's'}
          </Badge>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">Manage incoming orders for your store</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgressOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => <OrderCard key={order.id.toString()} order={order} />)
          )}
        </TabsContent>
        <TabsContent value="inProgress" className="mt-6 space-y-4">
          {inProgressOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No orders in progress
              </CardContent>
            </Card>
          ) : (
            inProgressOrders.map((order) => <OrderCard key={order.id.toString()} order={order} />)
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No completed orders
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => <OrderCard key={order.id.toString()} order={order} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
