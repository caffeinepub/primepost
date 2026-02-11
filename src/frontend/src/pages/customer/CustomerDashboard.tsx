import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Store, Search, TrendingUp, ShoppingCart, Package } from 'lucide-react';

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Access Store',
      description: 'Enter a Store ID to browse products',
      icon: Store,
      to: '/customer/store-access',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Find Stores',
      description: 'Search stores by name or category',
      icon: Search,
      to: '/customer/store-search',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Marketplace',
      description: 'Browse special deals and discounts',
      icon: TrendingUp,
      to: '/customer/marketplace',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'My Cart',
      description: 'Review and checkout your items',
      icon: ShoppingCart,
      to: '/customer/cart',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'My Orders',
      description: 'Track your order history',
      icon: Package,
      to: '/customer/orders',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.to}
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate({ to: action.to })}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
