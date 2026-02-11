import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCartStore } from '../../state/cartStore';
import { useGetStore, usePlaceOrder } from '../../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { formatPrice } from '../../utils/money';
import { Variant_mobileMoney_cash } from '../../backend';
import { useLocalPin } from '../../hooks/useLocalPin';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { toast } from 'sonner';
import { AlertCircle, Fingerprint, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem('checkout-store-id') || '';
  const { data: store } = useGetStore(storeId);
  const { items, getStoreTotal, clearCart } = useCartStore();
  const placeOrderMutation = usePlaceOrder();
  const { verifyPin } = useLocalPin();
  const { canUseBiometrics, isBiometricsEnabled, verifyBiometrics, isProcessing } = useBiometricAuth();

  const [tableNumber, setTableNumber] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobileMoney'>('cash');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const storeItems = items[storeId] || [];
  const total = getStoreTotal(storeId);

  if (storeItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No items to checkout</p>
          <Button onClick={() => navigate({ to: '/customer/cart' })}>
            Go to Cart
          </Button>
        </CardContent>
      </Card>
    );
  }

  const submitOrder = async () => {
    try {
      const orderItems: [string, bigint][] = storeItems.map((item) => [
        item.product.id,
        BigInt(item.quantity),
      ]);

      const orderId = await placeOrderMutation.mutateAsync({
        storeId,
        items: orderItems,
        tableNumber: tableNumber ? BigInt(tableNumber) : null,
        specialNote: specialNote || null,
        paymentMethod: paymentMethod === 'cash' ? Variant_mobileMoney_cash.cash : Variant_mobileMoney_cash.mobileMoney,
      });

      clearCart(storeId);
      localStorage.removeItem('checkout-store-id');
      toast.success('Order placed successfully!');
      navigate({ to: `/customer/order/${orderId}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  const handleBiometricConfirm = async () => {
    if (isAuthenticating || isProcessing) return;

    setIsAuthenticating(true);
    try {
      await verifyBiometrics();
      await submitOrder();
    } catch (error: any) {
      if (error.message.includes('cancelled')) {
        toast.info('Authentication cancelled');
      } else {
        toast.error('Biometric authentication failed');
      }
      setShowPinDialog(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinConfirm = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (!verifyPin(pin)) {
      toast.error('Incorrect PIN');
      setPin('');
      return;
    }

    setShowPinDialog(false);
    submitOrder();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const canUse = await canUseBiometrics();
    if (canUse && isBiometricsEnabled()) {
      await handleBiometricConfirm();
    } else {
      setShowPinDialog(true);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {storeItems.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.product.price * BigInt(item.quantity))}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Table Number (Optional)</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialNote">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialNote"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g., no pepper, less sugar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'mobileMoney')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobileMoney" id="mobileMoney" />
                  <Label htmlFor="mobileMoney">Mobile Money</Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'mobileMoney' && store && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Payment Instructions:</p>
                    <p className="text-sm">Please send {formatPrice(total)} to:</p>
                    <p className="font-mono font-bold text-lg my-2">{store.mobileMoneyNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Complete the payment before confirming your order.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={placeOrderMutation.isPending || isAuthenticating || isProcessing}
          >
            {placeOrderMutation.isPending ? 'Placing Order...' : isAuthenticating ? 'Authenticating...' : 'Confirm Order'}
          </Button>
        </form>
      </div>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm with PIN</DialogTitle>
            <DialogDescription>
              Enter your PIN to confirm this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
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
            <Button onClick={handlePinConfirm} className="w-full" disabled={pin.length !== 4}>
              Confirm Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
