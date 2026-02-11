import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllStores } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Store as StoreIcon } from 'lucide-react';

export default function StoreSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { data: stores = [], isLoading } = useGetAllStores();
  const navigate = useNavigate();

  const categories = ['all', 'restaurant', 'hotel', 'nightclub', 'shop'];

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || store.category === category;
    return matchesSearch && matchesCategory && !store.isBlocked;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find Stores</h1>
        <p className="text-muted-foreground">Search for stores by name or category</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Store name..."
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading stores...</div>
      ) : filteredStores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No stores found matching your criteria
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate({ to: `/customer/store/${store.id}` })}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <StoreIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{store.name}</CardTitle>
                <CardDescription>
                  <span className="capitalize">{store.category}</span> • {store.location}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
