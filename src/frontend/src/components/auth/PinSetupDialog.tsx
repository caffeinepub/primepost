import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useLocalPin } from '../../hooks/useLocalPin';
import { toast } from 'sonner';

export default function PinSetupDialog() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');
  const [error, setError] = useState<string | null>(null);
  const { setPin: savePin } = useLocalPin();

  const handleSetupComplete = () => {
    if (pin.length !== 4) {
      const errorMsg = 'PIN must be 4 digits';
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (confirmPin !== pin) {
      const errorMsg = 'PINs do not match. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
      setConfirmPin('');
      return;
    }

    try {
      setError(null);
      savePin(pin);
      toast.success('PIN set successfully!');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to save PIN. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

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
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
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
