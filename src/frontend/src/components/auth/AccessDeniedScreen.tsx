import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { performLogout } from '../../utils/logout';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Detect if this is an admin-only route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Log access denial for debugging
  React.useEffect(() => {
    console.log('[AccessDenied] Route denied', {
      path: location.pathname,
      profileRole: profile?.role || null,
      hasIdentity: !!identity,
      isAdminRoute,
    });
  }, [location.pathname, profile?.role, identity, isAdminRoute]);

  const handleSignOut = async () => {
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
      
      // Navigation is handled by performLogout
    } catch (error) {
      console.error('Sign out error:', error);
      // performLogout handles navigation even on error
    } finally {
      // Don't reset isLoggingOut since we're navigating away
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            {isAdminRoute 
              ? 'You are not signed in as an Admin. This area requires admin privileges.'
              : 'You don\'t have permission to access this page'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isAdminRoute && (
            <Button onClick={() => navigate({ to: '/login/admin' })} className="w-full">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Go to Admin Login
            </Button>
          )}
          <Button 
            onClick={() => navigate({ to: '/' })} 
            variant={isAdminRoute ? 'outline' : 'default'}
            className="w-full"
          >
            Return to Home
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
