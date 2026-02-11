import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useLocalPin } from '../../hooks/useLocalPin';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { toast } from 'sonner';
import { Fingerprint } from 'lucide-react';

export default function PinSetupDialog() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm' | 'biometric'>('setup');
  const { setPin: savePin } = useLocalPin();
  const { canUseBiometrics, enableBiometrics } = useBiometricAuth();

  const handleSetupComplete = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (confirmPin !== pin) {
      toast.error('PINs do not match');
      setConfirmPin('');
      return;
    }

    savePin(pin);
    toast.success('PIN set successfully!');

    if (canUseBiometrics()) {
      setStep('biometric');
    }
  };

  const handleEnableBiometrics = async () => {
    try {
      await enableBiometrics();
      toast.success('Biometric authentication enabled!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable biometrics');
    }
  };

  const handleSkipBiometrics = () => {
    // Dialog will close automatically when PIN is set
  };

  if (step === 'biometric') {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Enable Biometric Authentication</DialogTitle>
            <DialogDescription>
              Use fingerprint or face recognition for faster access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={handleEnableBiometrics} className="w-full">
                Enable Biometric Authentication
              </Button>
              <Button onClick={handleSkipBiometrics} variant="outline" className="w-full">
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{step === 'setup' ? 'Set Your PIN' : 'Confirm Your PIN'}</DialogTitle>
          <DialogDescription>
            {step === 'setup' 
              ? 'Create a 4-digit PIN to secure your account'
              : 'Re-enter your PIN to confirm'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={step === 'setup' ? pin : confirmPin}
              onChange={step === 'setup' ? setPin : setConfirmPin}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            onClick={step === 'setup' ? handleSetupComplete : handleConfirm}
            className="w-full"
            disabled={(step === 'setup' ? pin : confirmPin).length !== 4}
          >
            {step === 'setup' ? 'Continue' : 'Confirm PIN'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
