import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ThemeToggle from '../theme/ThemeToggle';
import { Store, ShoppingCart, Package, LayoutDashboard, Search, TrendingUp, LogOut, Menu, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'customer' | 'owner' | 'admin';
}

export default function AppLayout({ children, role }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const customerLinks = [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/store-search', label: 'Find Stores', icon: Search },
    { to: '/customer/marketplace', label: 'Marketplace', icon: TrendingUp },
    { to: '/customer/cart', label: 'Cart', icon: ShoppingCart },
    { to: '/customer/orders', label: 'Orders', icon: Package },
  ];

  const ownerLinks = [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/register-store', label: 'Register Store', icon: Store },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const links = role === 'customer' ? customerLinks : role === 'owner' ? ownerLinks : adminLinks;

  const NavLinks = () => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <button
            key={link.to}
            onClick={() => navigate({ to: link.to })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition text-foreground"
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2">
              <img src="/assets/generated/primepost-logo.dim_512x512.png" alt="PrimePost" className="h-8 w-8" />
              <span className="font-bold text-xl">PrimePost</span>
            </button>
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                  <Button variant="ghost" onClick={handleLogout} className="justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PrimePost. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                caffeine.ai
              </a>
            </p>
            <button
              onClick={() => navigate({ to: '/privacy' })}
              className="flex items-center gap-1 hover:text-foreground transition"
            >
              <Shield className="h-3 w-3" />
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
