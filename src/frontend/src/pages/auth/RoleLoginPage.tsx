import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserRole } from '../../backend';

interface RoleLoginPageProps {
  role: UserRole;
}

export default function RoleLoginPage({ role }: RoleLoginPageProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (identity && profile) {
      const targetPath = role === UserRole.customer ? '/customer' : role === UserRole.storeOwner ? '/owner' : '/admin';
      navigate({ to: targetPath });
    }
  }, [identity, profile, role, navigate]);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.customer]: 'Customer',
    [UserRole.storeOwner]: 'Store Owner',
    [UserRole.superAdmin]: 'Admin',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <img src="/assets/generated/primepost-logo.dim_512x512.png" alt="PrimePost" className="w-20 h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl">{roleLabels[role]} Login</CardTitle>
          <CardDescription>
            Sign in with Internet Identity to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Sign In'}
          </Button>
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
