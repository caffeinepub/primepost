import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useAndroidAuthBridge } from '../../hooks/useAndroidAuthBridge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '../../backend';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface RoleLoginPageProps {
  role: UserRole;
}

export default function RoleLoginPage({ role }: RoleLoginPageProps) {
  const { identity } = useInternetIdentity();
  const { login, loginStatus, isAndroid, authError, clearError } = useAndroidAuthBridge();
  const { data: profile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (identity && profile) {
      // Super Admin always goes directly to admin dashboard, bypassing terms
      if (role === UserRole.superAdmin && profile.role === UserRole.superAdmin) {
        navigate({ to: '/admin' });
        return;
      }

      // For other roles, navigate to their respective dashboards
      const targetPath = role === UserRole.customer ? '/customer' : role === UserRole.storeOwner ? '/owner' : '/admin';
      navigate({ to: targetPath });
    }
  }, [identity, profile, role, navigate]);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.customer]: 'Customer',
    [UserRole.storeOwner]: 'Store',
    [UserRole.superAdmin]: 'Admin',
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <img src="/assets/generated/primepost-logo.dim_512x512.png" alt="PrimePost" className="w-20 h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl">{roleLabels[role]} Login</CardTitle>
          <CardDescription>
            {isAndroid 
              ? 'Sign in with Internet Identity. The login will open in your browser.'
              : 'Sign in with Internet Identity to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          {isAndroid && !authError && (
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Login will open in your browser. After completing authentication, you'll be returned to the app automatically.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => {
              clearError();
              login();
            }}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In'}
          </Button>

          {authError && (
            <Button
              variant="outline"
              onClick={() => {
                clearError();
                login();
              }}
              className="w-full"
            >
              Try Again
            </Button>
          )}

          <Button
            variant="ghost"
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
