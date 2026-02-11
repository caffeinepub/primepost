import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useBootstrapSuperAdmin, useGetSuperAdminBootstrapped, useClearSuperAdminBootstrapState, useFactoryReset } from '../../hooks/useQueries';
import { useAndroidAuthBridge } from '../../hooks/useAndroidAuthBridge';
import { useQueryClient } from '@tanstack/react-query';
import { performFactoryResetCleanup } from '../../utils/logout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import FactoryResetDialog from '../../components/auth/FactoryResetDialog';
import { UserRole } from '../../backend';
import { AlertCircle, ExternalLink, ShieldAlert, ShieldCheck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface RoleLoginPageProps {
  role: UserRole;
}

export default function RoleLoginPage({ role }: RoleLoginPageProps) {
  const { identity, clear } = useInternetIdentity();
  const { login, loginStatus, isAndroid, authError, clearError } = useAndroidAuthBridge();
  const { data: profile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isBootstrapped, isLoading: bootstrapLoading, isFetched: bootstrapFetched } = useGetSuperAdminBootstrapped();
  const bootstrapMutation = useBootstrapSuperAdmin();
  const clearBootstrapMutation = useClearSuperAdminBootstrapState();
  const factoryResetMutation = useFactoryReset();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMismatchError, setRoleMismatchError] = React.useState<string | null>(null);
  const [factoryResetError, setFactoryResetError] = React.useState<string | null>(null);

  // Handle Admin bootstrap initialization
  const handleInitializeAdmin = async () => {
    try {
      await bootstrapMutation.mutateAsync();
      toast.success('Super Admin initialized successfully!');
      // The mutation will invalidate queries and trigger navigation via the effect below
    } catch (error: any) {
      console.error('[RoleLogin] Bootstrap error:', error);
      const errorMessage = error.message || 'Failed to initialize Super Admin';
      
      if (errorMessage.includes('already been bootstrapped')) {
        toast.error('Admin has already been initialized by another user');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Handle Admin bootstrap reset (stuck state recovery)
  const handleResetBootstrap = async () => {
    try {
      await clearBootstrapMutation.mutateAsync();
      toast.success('Admin initialization reset successfully!');
      // The mutation will invalidate queries and allow re-initialization
    } catch (error: any) {
      console.error('[RoleLogin] Clear bootstrap error:', error);
      const errorMessage = error.message || 'Failed to reset admin initialization';
      toast.error(errorMessage);
    }
  };

  // Handle Factory Reset
  const handleFactoryReset = async () => {
    setFactoryResetError(null);
    try {
      // 1. Call backend factory reset
      await factoryResetMutation.mutateAsync();
      
      // 2. Perform full client cleanup
      await performFactoryResetCleanup({
        clearIdentity: clear,
        queryClient,
        isAndroid,
      });

      // 3. Show success message
      toast.success('Application reset successfully!');

      // 4. Navigate to home
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('[RoleLogin] Factory reset error:', error);
      const errorMessage = error.message || 'Failed to reset application';
      setFactoryResetError(errorMessage);
      
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Only Super Admin can perform a factory reset');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Clear role mismatch error when component unmounts or before navigation
  React.useEffect(() => {
    return () => {
      setRoleMismatchError(null);
      setFactoryResetError(null);
    };
  }, []);

  // Navigate to appropriate dashboard when profile is loaded and role matches
  React.useEffect(() => {
    if (!identity || !profile || profileLoading || !profileFetched) return;

    // Check if profile role matches the requested role
    if (profile.role !== role) {
      const roleNames = {
        [UserRole.customer]: 'Customer',
        [UserRole.storeOwner]: 'Store Owner',
        [UserRole.superAdmin]: 'Admin',
      };
      setRoleMismatchError(
        `Your account is registered as a ${roleNames[profile.role]}, but you're trying to log in as a ${roleNames[role]}. Please use the correct login option.`
      );
      return;
    }

    // Clear any previous role mismatch error
    setRoleMismatchError(null);

    // Navigate to the appropriate dashboard
    switch (role) {
      case UserRole.customer:
        navigate({ to: '/customer' });
        break;
      case UserRole.storeOwner:
        navigate({ to: '/owner' });
        break;
      case UserRole.superAdmin:
        navigate({ to: '/admin' });
        break;
    }
  }, [identity, profile, profileLoading, profileFetched, role, navigate]);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const roleLabels = {
    [UserRole.customer]: 'Customer',
    [UserRole.storeOwner]: 'Store Owner',
    [UserRole.superAdmin]: 'Admin',
  };

  const roleDescriptions = {
    [UserRole.customer]: 'Access your orders, browse stores, and shop from the marketplace',
    [UserRole.storeOwner]: 'Manage your stores, products, and customer orders',
    [UserRole.superAdmin]: 'Manage the entire platform, stores, and users',
  };

  // Show loading state while checking authentication and profile
  if (isAuthenticated && (profileLoading || bootstrapLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin-specific: Show bootstrap initialization UI when not bootstrapped
  const showBootstrapUI = role === UserRole.superAdmin && isAuthenticated && bootstrapFetched && !isBootstrapped;

  // Admin-specific: Show stuck state recovery UI when bootstrapped but user is not an admin
  const showStuckStateUI = 
    role === UserRole.superAdmin && 
    isAuthenticated && 
    bootstrapFetched && 
    isBootstrapped && 
    profileFetched && 
    profile?.role !== UserRole.superAdmin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-3xl">📱</span>
          </div>
          <CardTitle className="text-2xl font-bold">{roleLabels[role]} Login</CardTitle>
          <CardDescription className="text-base">
            {roleDescriptions[role]}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Android Auth Error */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-start justify-between gap-2">
                <span className="flex-1">{authError}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Role Mismatch Error */}
          {roleMismatchError && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{roleMismatchError}</AlertDescription>
            </Alert>
          )}

          {/* Admin Bootstrap UI */}
          {showBootstrapUI && (
            <Alert className="border-primary/50 bg-primary/5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <AlertDescription className="space-y-3">
                <p className="font-medium text-foreground">
                  Super Admin has not been initialized yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the button below to become the first Super Admin of this application.
                </p>
                <Button
                  onClick={handleInitializeAdmin}
                  disabled={bootstrapMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {bootstrapMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Initializing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Initialize Super Admin
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Admin Stuck State Recovery UI */}
          {showStuckStateUI && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="font-medium">
                  Admin initialization is in an inconsistent state.
                </p>
                <p className="text-sm">
                  The system shows Admin has been initialized, but your account is not registered as an Admin. 
                  This can happen if the initialization was interrupted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={clearBootstrapMutation.isPending}
                    >
                      {clearBootstrapMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset Admin Initialization
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Admin Initialization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear the Admin initialization state, allowing you or another user to initialize Super Admin again.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetBootstrap}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Reset Initialization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AlertDescription>
            </Alert>
          )}

          {/* Login Button */}
          {!isAuthenticated && (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in with Internet Identity
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {/* Factory Reset Button (Admin only, when authenticated) */}
          {role === UserRole.superAdmin && isAuthenticated && (
            <div className="pt-4 border-t">
              <FactoryResetDialog
                onConfirm={handleFactoryReset}
                isPending={factoryResetMutation.isPending}
                error={factoryResetError}
                trigger={
                  <Button variant="destructive" size="sm" className="w-full">
                    Factory Reset Application
                  </Button>
                }
              />
            </div>
          )}

          {/* Back to Home */}
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="w-full"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
