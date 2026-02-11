import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useLocalPin } from '../../hooks/useLocalPin';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { toast } from 'sonner';
import { Fingerprint, Lock } from 'lucide-react';

export default function UnlockDialog() {
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyPin, unlock } = useLocalPin();
  const { canUseBiometrics, isBiometricsEnabled, verifyBiometrics, isProcessing } = useBiometricAuth();

  const handleBiometricUnlock = async () => {
    if (isAuthenticating || isProcessing) return;
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      await verifyBiometrics();
      unlock();
      toast.success('Unlocked successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Biometric authentication failed';
      
      if (errorMessage.includes('cancelled')) {
        toast.info('Authentication cancelled');
        setError('Authentication was cancelled. Please try again or use your PIN.');
      } else {
        toast.error('Biometric authentication failed');
        setError(errorMessage);
      }
      
      setShowPinInput(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinUnlock = async () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setError(null);

    try {
      if (verifyPin(pin)) {
        unlock();
        toast.success('Unlocked successfully!');
      } else {
        const errorMsg = 'Incorrect PIN. Please try again.';
        toast.error(errorMsg);
        setError(errorMsg);
        setPin('');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to unlock. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
      setPin('');
    }
  };

  useEffect(() => {
    const tryBiometric = async () => {
      try {
        const canUse = await canUseBiometrics();
        if (canUse && isBiometricsEnabled() && !showPinInput) {
          await handleBiometricUnlock();
        } else {
          setShowPinInput(true);
        }
      } catch (error) {
        setShowPinInput(true);
      }
    };

    tryBiometric();
  }, []);

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Unlock PrimePost</DialogTitle>
          <DialogDescription>
            {isAuthenticating ? 'Authenticating...' : showPinInput ? 'Enter your PIN to continue' : 'Preparing authentication...'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {showPinInput && (
            <>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handlePinUnlock} 
                  className="w-full" 
                  disabled={pin.length !== 4}
                >
                  Unlock
                </Button>
                {isBiometricsEnabled() && (
                  <Button 
                    onClick={handleBiometricUnlock} 
                    variant="outline" 
                    className="w-full"
                    disabled={isAuthenticating || isProcessing}
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    {isAuthenticating ? 'Authenticating...' : 'Use Biometric Authentication'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
