import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface FactoryResetDialogProps {
  onConfirm: () => Promise<void>;
  isPending: boolean;
  error: string | null;
  trigger?: React.ReactNode;
}

const CONFIRMATION_PHRASE = 'RESET ALL DATA';

export default function FactoryResetDialog({ onConfirm, isPending, error, trigger }: FactoryResetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const isConfirmationValid = confirmationText === CONFIRMATION_PHRASE;

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      setLocalError('Please type the exact confirmation phrase');
      return;
    }

    setLocalError(null);
    try {
      await onConfirm();
      // Dialog will be closed by parent component after successful reset
    } catch (err: any) {
      setLocalError(err.message || 'Failed to reset application');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        // Clear local state when dialog closes
        setConfirmationText('');
        setLocalError(null);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            Factory Reset Application
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Factory Reset Application
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="font-semibold text-foreground">
              This action will permanently delete ALL application data:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All user profiles and accounts</li>
              <li>All stores and products</li>
              <li>All orders and reviews</li>
              <li>All terms & conditions content</li>
              <li>Admin initialization status</li>
            </ul>
            <p className="font-semibold text-destructive">
              This cannot be undone. The application will return to a fresh install state.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type <span className="font-mono font-bold">{CONFIRMATION_PHRASE}</span> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={CONFIRMATION_PHRASE}
              disabled={isPending}
              className="font-mono"
              autoComplete="off"
            />
          </div>

          {(localError || error) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{localError || error}</AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!isConfirmationValid || isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Application'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
