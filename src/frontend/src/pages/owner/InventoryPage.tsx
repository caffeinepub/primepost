import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStoreProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ExternalBlob, type Product } from '../../backend';

export default function InventoryPage() {
  const { storeId } = useParams({ strict: false }) as { storeId: string };
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGetStoreProducts(storeId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stockQty: '',
    discount: '',
    marketplace: false,
    imageFile: null as File | null,
  });

  const lowStockThreshold = 10;

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: (Number(product.price) / 100).toString(),
        stockQty: product.stockQty.toString(),
        discount: product.discount ? product.discount.toString() : '',
        marketplace: product.marketplace,
        imageFile: null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        stockQty: '',
        discount: '',
        marketplace: false,
        imageFile: null,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stockQty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const price = BigInt(Math.round(parseFloat(formData.price) * 100));
      const stockQty = BigInt(formData.stockQty);
      const discount = formData.discount ? BigInt(formData.discount) : null;

      let imageRef: ExternalBlob;
      if (formData.imageFile) {
        const bytes = new Uint8Array(await formData.imageFile.arrayBuffer());
        imageRef = ExternalBlob.fromBytes(bytes);
      } else if (editingProduct) {
        imageRef = editingProduct.imageRef;
      } else {
        toast.error('Please select an image');
        return;
      }

      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          storeId,
          name: formData.name,
          imageRef,
          price,
          stockQty,
          discount,
          marketplace: formData.marketplace,
        });
        toast.success('Product updated successfully!');
      } else {
        await createMutation.mutateAsync({
          storeId,
          name: formData.name,
          imageRef,
          price,
          stockQty,
        });
        toast.success('Product created successfully!');
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteMutation.mutateAsync({ id: productId, storeId });
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/owner' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQty">Stock Quantity *</Label>
                <Input
                  id="stockQty"
                  type="number"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Product Image {!editingProduct && '*'}</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                  required={!editingProduct}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="marketplace"
                  checked={formData.marketplace}
                  onCheckedChange={(checked) => setFormData({ ...formData, marketplace: checked })}
                />
                <Label htmlFor="marketplace">Show in Marketplace</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory ({products.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const isLowStock = Number(product.stockQty) < lowStockThreshold && Number(product.stockQty) > 0;

                return (
                  <div key={product.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <img
                      src={product.imageRef.getDirectURL()}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_1024x1024.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${(Number(product.price) / 100).toFixed(2)}
                        {product.discount && ` • ${product.discount}% off`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.outOfStock ? (
                          <Badge variant="secondary">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock: {product.stockQty.toString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Stock: {product.stockQty.toString()}</Badge>
                        )}
                        {product.marketplace && <Badge>Marketplace</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleOpenDialog(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
