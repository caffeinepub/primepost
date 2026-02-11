import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStore, useGetStoreProducts, useGetStoreReviews } from '../../hooks/useQueries';
import { useCartStore } from '../../state/cartStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, calculateEffectivePrice } from '../../utils/money';
import { ShoppingCart, Star, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function StoreDetailPage() {
  const { storeId } = useParams({ strict: false }) as { storeId: string };
  const navigate = useNavigate();
  const { data: store, isLoading: storeLoading } = useGetStore(storeId);
  const { data: products = [], isLoading: productsLoading } = useGetStoreProducts(storeId);
  const { data: reviews = [] } = useGetStoreReviews(storeId);
  const addItem = useCartStore((state) => state.addItem);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  const handleAddToCart = (product: typeof products[0]) => {
    if (product.outOfStock || product.stockQty === 0n) {
      toast.error('This item is out of stock');
      return;
    }
    addItem(storeId, product);
    toast.success('Added to cart');
  };

  if (storeLoading || productsLoading) {
    return <div className="text-center py-12">Loading store...</div>;
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Store not found</p>
          <Button onClick={() => navigate({ to: '/customer/store-search' })}>
            Search Stores
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{store.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="capitalize flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {store.category} • {store.location}
                </span>
              </CardDescription>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>
            <Button onClick={() => navigate({ to: '/customer/cart' })}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No products available
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const effectivePrice = calculateEffectivePrice(product.price, product.discount || undefined);
              const isAvailable = !product.outOfStock && product.stockQty > 0n;

              return (
                <Card key={product.id} className={!isAvailable ? 'opacity-60' : ''}>
                  <CardHeader>
                    <img
                      src={product.imageRef.getDirectURL()}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_1024x1024.png';
                      }}
                    />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {product.discount ? (
                            <>
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(effectivePrice)}
                              </span>
                              <span className="text-sm line-through text-muted-foreground">
                                {formatPrice(product.price)}
                              </span>
                              <Badge variant="destructive">{product.discount}% OFF</Badge>
                            </>
                          ) : (
                            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {isAvailable ? (
                        <>
                          <Badge variant="outline">In Stock: {product.stockQty.toString()}</Badge>
                          <Button size="sm" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="w-full justify-center">Out of Stock</Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Number(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {review.text && <p className="text-sm text-muted-foreground">{review.text}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
