import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { toast } from 'sonner';
import { Fingerprint, X } from 'lucide-react';

interface BiometricEnablementDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BiometricEnablementDialog({ open, onClose }: BiometricEnablementDialogProps) {
  const { enableBiometrics, isProcessing } = useBiometricAuth();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnableBiometrics = async () => {
    setIsEnabling(true);
    try {
      await enableBiometrics();
      toast.success('Biometric authentication enabled!');
      onClose();
    } catch (error: any) {
      if (error.message.includes('cancelled')) {
        toast.info('Biometric setup cancelled');
      } else {
        toast.error(error.message || 'Failed to enable biometrics');
      }
    } finally {
      setIsEnabling(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isEnabling && onClose()}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleSkip}
          disabled={isEnabling}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
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
            <Button 
              onClick={handleEnableBiometrics} 
              className="w-full"
              disabled={isEnabling || isProcessing}
            >
              {isEnabling ? 'Setting up...' : 'Enable Biometric Authentication'}
            </Button>
            <Button 
              onClick={handleSkip} 
              variant="outline" 
              className="w-full"
              disabled={isEnabling || isProcessing}
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
