import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSaveCallerUserProfile, useBootstrapSuperAdmin } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { UserRole } from '../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ProfileSetupDialog() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [stateOfResidence, setStateOfResidence] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.customer);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const saveMutation = useSaveCallerUserProfile();
  const bootstrapMutation = useBootstrapSuperAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !dateOfBirth.trim() || !nationality.trim() || !stateOfResidence.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the Terms and Conditions');
      return;
    }

    try {
      if (selectedRole === UserRole.superAdmin) {
        await bootstrapMutation.mutateAsync();
      }

      await saveMutation.mutateAsync({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        dateOfBirth: dateOfBirth.trim(),
        nationality: nationality.trim(),
        stateOfResidence: stateOfResidence.trim(),
        role: selectedRole,
        isSuspended: false,
        acceptedCustomerTerms: false,
        acceptedStoreOwnerTerms: false,
      });
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to PrimePost!</DialogTitle>
          <DialogDescription>
            Please complete your profile to continue
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Enter your nationality"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateOfResidence">State of Residence *</Label>
              <Input
                id="stateOfResidence"
                value={stateOfResidence}
                onChange={(e) => setStateOfResidence(e.target.value)}
                placeholder="Enter your state of residence"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Your Role *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === UserRole.customer ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.customer)}
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === UserRole.storeOwner ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.storeOwner)}
                >
                  Owner
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === UserRole.superAdmin ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(UserRole.superAdmin)}
                >
                  Admin
                </Button>
              </div>
            </div>
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I accept the Terms and Conditions for using this application
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending || bootstrapMutation.isPending}>
              {saveMutation.isPending || bootstrapMutation.isPending ? 'Creating...' : 'Continue'}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
