import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useHasAcceptedTerms } from './hooks/useQueries';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { LanguageProvider } from './i18n/LanguageProvider';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import RoleLoginPage from './pages/auth/RoleLoginPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import StoreAccessPage from './pages/customer/StoreAccessPage';
import StoreSearchPage from './pages/customer/StoreSearchPage';
import StoreDetailPage from './pages/customer/StoreDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import MarketplacePage from './pages/customer/MarketplacePage';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import StoreRegistrationPage from './pages/owner/StoreRegistrationPage';
import StoreSettingsPage from './pages/owner/StoreSettingsPage';
import InventoryPage from './pages/owner/InventoryPage';
import OrdersManagementPage from './pages/owner/OrdersManagementPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import PinSetupDialog from './components/auth/PinSetupDialog';
import BiometricEnablementDialog from './components/auth/BiometricEnablementDialog';
import UnlockDialog from './components/auth/UnlockDialog';
import TermsAcceptancePage from './pages/terms/TermsAcceptancePage';
import PrivacyPolicyPage from './pages/terms/PrivacyPolicyPage';
import ApkDownloadPage from './pages/public/ApkDownloadPage';
import { UserRole, TermsType } from './backend';
import { useLocalPin } from './hooks/useLocalPin';
import { useBiometricAuth } from './hooks/useBiometricAuth';
import { useLanguage } from './i18n/LanguageProvider';
import React from 'react';
import { Download } from 'lucide-react';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isPinSet, isUnlocked } = useLocalPin();
  const { canUseBiometrics, isBiometricsEnabled } = useBiometricAuth();
  const [showBiometricDialog, setShowBiometricDialog] = React.useState(false);
  const [biometricCheckDone, setBiometricCheckDone] = React.useState(false);

  const isAuthenticated = !!identity;
  const pinIsSet = isPinSet();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && profile === null;
  const showPinSetup = isAuthenticated && !profileLoading && profile !== null && !pinIsSet;
  const showUnlock = isAuthenticated && !profileLoading && profile !== null && pinIsSet && !isUnlocked;

  React.useEffect(() => {
    const checkBiometric = async () => {
      if (isAuthenticated && profile && pinIsSet && isUnlocked && !biometricCheckDone) {
        const canUse = await canUseBiometrics();
        if (canUse && !isBiometricsEnabled()) {
          setShowBiometricDialog(true);
        }
        setBiometricCheckDone(true);
      }
    };

    checkBiometric();
  }, [isAuthenticated, profile, pinIsSet, isUnlocked, biometricCheckDone, canUseBiometrics, isBiometricsEnabled]);

  return (
    <>
      <Outlet />
      {showProfileSetup && <ProfileSetupDialog />}
      {showPinSetup && <PinSetupDialog />}
      {showUnlock && <UnlockDialog />}
      {showBiometricDialog && (
        <BiometricEnablementDialog 
          open={showBiometricDialog} 
          onClose={() => setShowBiometricDialog(false)} 
        />
      )}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent
});

function IndexComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (identity && profile) {
      if (profile.role === UserRole.customer) {
        navigate({ to: '/customer' });
      } else if (profile.role === UserRole.storeOwner) {
        navigate({ to: '/owner' });
      } else if (profile.role === UserRole.superAdmin) {
        navigate({ to: '/admin' });
      }
    }
  }, [identity, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="text-center space-y-8 p-8 max-w-2xl w-full">
        <img src="/assets/generated/primepost-logo.dim_512x512.png" alt="PrimePost" className="w-32 h-32 mx-auto" />
        <h1 className="text-4xl font-bold">{t('home.welcome')}</h1>
        <p className="text-muted-foreground text-lg">{t('home.chooseRole')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate({ to: '/login/customer' })} 
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            {t('home.loginAsCustomer')}
          </button>
          <button 
            onClick={() => navigate({ to: '/login/owner' })} 
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            {t('home.loginAsStoreOwner')}
          </button>
          <button 
            onClick={() => navigate({ to: '/login/admin' })} 
            className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            {t('home.loginAsSuperAdmin')}
          </button>
        </div>
        <div className="pt-6">
          <button
            onClick={() => navigate({ to: '/download' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg"
          >
            <Download className="w-5 h-5" />
            {t('home.downloadApp')}
          </button>
        </div>
      </div>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent
});

function LoginCustomerComponent() {
  return <RoleLoginPage role={UserRole.customer} />;
}

const loginCustomerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/customer',
  component: LoginCustomerComponent
});

function LoginOwnerComponent() {
  return <RoleLoginPage role={UserRole.storeOwner} />;
}

const loginOwnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/owner',
  component: LoginOwnerComponent
});

function LoginAdminComponent() {
  return <RoleLoginPage role={UserRole.superAdmin} />;
}

const loginAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/admin',
  component: LoginAdminComponent
});

const apkDownloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download',
  component: ApkDownloadPage
});

function CustomerRouteComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: hasAccepted, isLoading: termsLoading } = useHasAcceptedTerms(TermsType.customerTerms);

  React.useEffect(() => {
    if (!identity && !profileLoading) {
      navigate({ to: '/login/customer' });
    }
  }, [identity, profileLoading, navigate]);

  React.useEffect(() => {
    if (identity && profile && profile.role === UserRole.customer && !termsLoading && hasAccepted === false) {
      navigate({ to: '/terms/customer' });
    }
  }, [identity, profile, hasAccepted, termsLoading, navigate]);

  if (!profileLoading && profile && profile.role !== UserRole.customer) {
    return <AccessDeniedScreen />;
  }

  if (!identity || profileLoading || (!termsLoading && hasAccepted === false)) {
    return null;
  }

  return (
    <AppLayout role="customer">
      <Outlet />
    </AppLayout>
  );
}

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer',
  component: CustomerRouteComponent
});

const customerDashboardRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/',
  component: CustomerDashboard
});

const customerSettingsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/settings',
  component: CustomerSettingsPage
});

const storeAccessRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/store-access',
  component: StoreAccessPage
});

const storeSearchRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/store-search',
  component: StoreSearchPage
});

const storeDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/store/$storeId',
  component: StoreDetailPage
});

const cartRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/cart',
  component: CartPage
});

const checkoutRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/checkout/$storeId',
  component: CheckoutPage
});

const ordersRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/orders',
  component: OrdersPage
});

const orderDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/order/$orderId',
  component: OrderDetailPage
});

const marketplaceRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/marketplace',
  component: MarketplacePage
});

function OwnerRouteComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: hasAccepted, isLoading: termsLoading } = useHasAcceptedTerms(TermsType.storeOwnerTerms);

  React.useEffect(() => {
    if (!identity && !profileLoading) {
      navigate({ to: '/login/owner' });
    }
  }, [identity, profileLoading, navigate]);

  React.useEffect(() => {
    if (identity && profile && profile.role === UserRole.storeOwner && !termsLoading && hasAccepted === false) {
      navigate({ to: '/terms/owner' });
    }
  }, [identity, profile, hasAccepted, termsLoading, navigate]);

  if (!profileLoading && profile && profile.role !== UserRole.storeOwner) {
    return <AccessDeniedScreen />;
  }

  if (!identity || profileLoading || (!termsLoading && hasAccepted === false)) {
    return null;
  }

  return (
    <AppLayout role="owner">
      <Outlet />
    </AppLayout>
  );
}

const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner',
  component: OwnerRouteComponent
});

const ownerDashboardRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/',
  component: OwnerDashboard
});

const ownerSettingsRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/settings',
  component: OwnerSettingsPage
});

const storeRegistrationRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/register-store',
  component: StoreRegistrationPage
});

const storeSettingsRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/store/$storeId/settings',
  component: StoreSettingsPage
});

const inventoryRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/store/$storeId/inventory',
  component: InventoryPage
});

const ordersManagementRoute = createRoute({
  getParentRoute: () => ownerRoute,
  path: '/store/$storeId/orders',
  component: OrdersManagementPage
});

function AdminRouteComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();

  React.useEffect(() => {
    if (!identity && !profileLoading) {
      navigate({ to: '/login/admin' });
    }
  }, [identity, profileLoading, navigate]);

  if (!profileLoading && profile && profile.role !== UserRole.superAdmin) {
    return <AccessDeniedScreen />;
  }

  if (!identity || profileLoading) {
    return null;
  }

  return (
    <AppLayout role="admin">
      <Outlet />
    </AppLayout>
  );
}

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRouteComponent
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminDashboard
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings',
  component: AdminSettingsPage
});

function TermsCustomerComponent() {
  return <TermsAcceptancePage termsType={TermsType.customerTerms} />;
}

const termsCustomerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms/customer',
  component: TermsCustomerComponent
});

function TermsOwnerComponent() {
  return <TermsAcceptancePage termsType={TermsType.storeOwnerTerms} />;
}

const termsOwnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms/owner',
  component: TermsOwnerComponent
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPolicyPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginCustomerRoute,
  loginOwnerRoute,
  loginAdminRoute,
  apkDownloadRoute,
  customerRoute.addChildren([
    customerDashboardRoute,
    customerSettingsRoute,
    storeAccessRoute,
    storeSearchRoute,
    storeDetailRoute,
    cartRoute,
    checkoutRoute,
    ordersRoute,
    orderDetailRoute,
    marketplaceRoute
  ]),
  ownerRoute.addChildren([
    ownerDashboardRoute,
    ownerSettingsRoute,
    storeRegistrationRoute,
    storeSettingsRoute,
    inventoryRoute,
    ordersManagementRoute
  ]),
  adminRoute.addChildren([
    adminDashboardRoute,
    adminSettingsRoute
  ]),
  termsCustomerRoute,
  termsOwnerRoute,
  privacyPolicyRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}
