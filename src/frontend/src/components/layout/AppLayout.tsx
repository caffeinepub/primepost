import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ThemeToggle from '../theme/ThemeToggle';
import { Store, ShoppingCart, Package, LayoutDashboard, Search, TrendingUp, LogOut, Menu, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { performLogout } from '../../utils/logout';
import { useLanguage } from '../../i18n/LanguageProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'customer' | 'owner' | 'admin';
}

export default function AppLayout({ children, role }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const isAndroid = /android/i.test(navigator.userAgent) && 
                        window.location.hostname !== 'localhost';
      
      await performLogout({
        clearIdentity: clear,
        queryClient,
        isAndroid,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Don't reset isLoggingOut since we're navigating away
    }
  };

  const customerLinks = [
    { to: '/customer', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/customer/store-search', label: t('nav.findStores'), icon: Search },
    { to: '/customer/marketplace', label: t('nav.marketplace'), icon: TrendingUp },
    { to: '/customer/cart', label: t('nav.cart'), icon: ShoppingCart },
    { to: '/customer/orders', label: t('nav.orders'), icon: Package },
    { to: '/customer/settings', label: t('nav.settings'), icon: Settings },
  ];

  const ownerLinks = [
    { to: '/owner', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/owner/register-store', label: t('nav.registerStore'), icon: Store },
    { to: '/owner/settings', label: t('nav.settings'), icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
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
              <span className="font-bold text-xl">{t('common.appName')}</span>
            </button>
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(val) => setLanguage(val as 'en' | 'fr')}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden md:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? t('nav.loggingOut') : t('nav.logout')}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? t('nav.loggingOut') : t('nav.logout')}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}.
          </p>
          <p className="mt-2">
            {t('footer.builtWith')} {t('footer.love')} {t('footer.using')}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
