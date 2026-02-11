import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetMarketplaceProducts, useGetAllStores } from '../../hooks/useQueries';
import { useCartStore } from '../../state/cartStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatPrice, calculateEffectivePrice } from '../../utils/money';
import { Search, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const { data: products = [], isLoading } = useGetMarketplaceProducts();
  const { data: stores = [] } = useGetAllStores();
  const addItem = useCartStore((state) => state.addItem);

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const categories = ['all', ...new Set(stores.map((s) => s.category))];

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const store = storeMap.get(product.storeId);
    const matchesCategory = category === 'all' || store?.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const priceA = calculateEffectivePrice(a.price, a.discount || undefined);
      const priceB = calculateEffectivePrice(b.price, b.discount || undefined);
      return Number(priceA - priceB);
    });
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addItem(product.storeId, product);
    toast.success('Added to cart');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Marketplace
        </h1>
        <p className="text-muted-foreground">Discover special deals and discounts</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Product name..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No products found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const effectivePrice = calculateEffectivePrice(product.price, product.discount || undefined);
            const store = storeMap.get(product.storeId);

            return (
              <Card key={product.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <img
                    src={product.imageRef.getDirectURL()}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_1024x1024.png';
                    }}
                  />
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="cursor-pointer hover:underline" onClick={() => navigate({ to: `/customer/store/${product.storeId}` })}>
                    {store?.name || product.storeId}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(effectivePrice)}
                    </span>
                    {product.discount && (
                      <>
                        <span className="text-sm line-through text-muted-foreground">
                          {formatPrice(product.price)}
                        </span>
                        <Badge variant="destructive">{product.discount}% OFF</Badge>
                      </>
                    )}
                  </div>
                  <Button className="w-full mt-4" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
