import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMyOrders, useGetStore } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '../../utils/money';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: orders = [] } = useGetMyOrders();
  const order = orders.find((o) => o.id.toString() === orderId);
  const { data: store } = useGetStore(order?.storeId || '');

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate({ to: '/customer/orders' })}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      inProgress: 'default',
      onTheWay: 'default',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'} className="text-base px-4 py-1">
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </Badge>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/customer/orders' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
              <p className="text-muted-foreground mt-2">
                Store: {store?.name || order.storeId}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map(([productId, quantity], idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{productId}</span>
                  <span>Qty: {quantity.toString()}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {order.tableNumber && (
              <div>
                <p className="text-muted-foreground">Table Number</p>
                <p className="font-semibold">{order.tableNumber.toString()}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-semibold capitalize">{order.paymentMethod}</p>
            </div>
          </div>

          {order.specialNote && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">Special Instructions</p>
                <p className="text-sm">{order.specialNote}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
