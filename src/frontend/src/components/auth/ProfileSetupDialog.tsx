import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSaveCallerUserProfile, useBootstrapSuperAdmin, useGetSuperAdminBootstrapped } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { UserRole } from '../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider';

export default function ProfileSetupDialog() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [stateOfResidence, setStateOfResidence] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.customer);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const saveMutation = useSaveCallerUserProfile();
  const bootstrapMutation = useBootstrapSuperAdmin();
  const { data: isBootstrapped, isLoading: bootstrapLoading, isFetched: bootstrapFetched } = useGetSuperAdminBootstrapped();
  const { t } = useLanguage();

  // Admin role bypasses terms requirement
  const requiresTerms = selectedRole !== UserRole.superAdmin;

  // Admin role is only available when Super Admin is not bootstrapped yet
  const isAdminAvailable = bootstrapFetched && isBootstrapped === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !dateOfBirth.trim() || !nationality.trim() || !stateOfResidence.trim()) {
      toast.error(t('profileSetup.fillAllFields'));
      return;
    }

    // Validate both terms and privacy acceptance for Customer and Store Owner roles
    if (requiresTerms && (!acceptedTerms || !acceptedPrivacy)) {
      toast.error(t('profileSetup.mustAcceptTerms'));
      return;
    }

    // Check if Admin role is selected but not available
    if (selectedRole === UserRole.superAdmin && !isAdminAvailable) {
      toast.error('Super Admin has already been initialized. Please choose Customer or Store Owner role, or sign in with an authorized admin account.');
      return;
    }

    try {
      if (selectedRole === UserRole.superAdmin) {
        await bootstrapMutation.mutateAsync();
      }

      await saveMutation.mutateAsync({
        userId: '', // Backend will auto-generate this for new users
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        dateOfBirth: dateOfBirth.trim(),
        nationality: nationality.trim(),
        stateOfResidence: stateOfResidence.trim(),
        role: selectedRole,
        isSuspended: false,
        acceptedCustomerTerms: selectedRole === UserRole.customer,
        acceptedStoreOwnerTerms: selectedRole === UserRole.storeOwner,
      });
      toast.success(t('profileSetup.profileCreated'));
    } catch (error: any) {
      console.error('[ProfileSetup] Error:', error);
      const errorMessage = error.message || 'Failed to create profile';
      
      if (errorMessage.includes('already been bootstrapped')) {
        toast.error('Super Admin has already been initialized. Please choose a different role.');
        setSelectedRole(UserRole.customer);
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You are not authorized to create this type of account.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('profileSetup.title')}</DialogTitle>
          <DialogDescription>
            {t('profileSetup.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('profileSetup.fullName')} *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('profileSetup.fullName')}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('profileSetup.phoneNumber')} *</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t('profileSetup.phoneNumber')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profileSetup.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('profileSetup.email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('profileSetup.dateOfBirth')} *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">{t('profileSetup.nationality')} *</Label>
              <Input
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder={t('profileSetup.nationality')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateOfResidence">{t('profileSetup.stateOfResidence')} *</Label>
              <Input
                id="stateOfResidence"
                value={stateOfResidence}
                onChange={(e) => setStateOfResidence(e.target.value)}
                placeholder={t('profileSetup.stateOfResidence')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profileSetup.selectRole')} *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === UserRole.customer ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.customer)}
                >
                  {t('roles.customer')}
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === UserRole.storeOwner ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.storeOwner)}
                >
                  {t('roles.storeOwner')}
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === UserRole.superAdmin ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.superAdmin)}
                  disabled={!isAdminAvailable && bootstrapFetched}
                >
                  {t('roles.superAdmin')}
                </Button>
              </div>
              {selectedRole === UserRole.superAdmin && !isAdminAvailable && bootstrapFetched && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Super Admin has already been initialized. Please choose Customer or Store Owner, or sign in with an authorized admin account.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            {requiresTerms && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    {t('profileSetup.acceptTerms')}
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                    {t('profileSetup.acceptPrivacy')}
                  </Label>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={saveMutation.isPending || bootstrapMutation.isPending || bootstrapLoading}>
              {saveMutation.isPending || bootstrapMutation.isPending ? t('profileSetup.creating') : t('profileSetup.createProfile')}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
