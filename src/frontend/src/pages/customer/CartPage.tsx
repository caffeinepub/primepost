import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCartStore } from '../../state/cartStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, calculateEffectivePrice } from '../../utils/money';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getStoreTotal } = useCartStore();

  const allStoreIds = Object.keys(items);
  const hasItems = allStoreIds.some((storeId) => items[storeId]?.length > 0);

  if (!hasItems) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => navigate({ to: '/customer/store-search' })}>
            Browse Stores
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your items and proceed to checkout</p>
      </div>

      {allStoreIds.map((storeId) => {
        const storeItems = items[storeId] || [];
        if (storeItems.length === 0) return null;

        const total = getStoreTotal(storeId);

        return (
          <Card key={storeId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Store: {storeId}</CardTitle>
                <Button onClick={() => navigate({ to: `/customer/store/${storeId}` })} variant="outline" size="sm">
                  Continue Shopping
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {storeItems.map((item) => {
                const effectivePrice = calculateEffectivePrice(item.product.price, item.product.discount || undefined);
                const lineTotal = effectivePrice * BigInt(item.quantity);

                return (
                  <div key={item.product.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <img
                      src={item.product.imageRef.getDirectURL()}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_1024x1024.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(effectivePrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(storeId, item.product.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(storeId, item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= Number(item.product.stockQty)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold">{formatPrice(lineTotal)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(storeId, item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  localStorage.setItem('checkout-store-id', storeId);
                  navigate({ to: '/customer/checkout' });
                }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
