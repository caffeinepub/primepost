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
  const { setPin: savePin } = useLocalPin();

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
