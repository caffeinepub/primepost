import { useState, useCallback } from 'react';
import { isWebAuthnAvailable, isPlatformAuthenticatorAvailable } from '../utils/webauthn';

const BIOMETRIC_ENABLED_KEY = 'primepost_biometric_enabled';
const CREDENTIAL_ID_KEY = 'primepost_credential_id';

export function useBiometricAuth() {
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const canUseBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const available = await isWebAuthnAvailable();
      if (!available) return false;
      return await isPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }, []);

  const isBiometricsEnabled = useCallback((): boolean => {
    return isEnabled;
  }, [isEnabled]);

  const enableBiometrics = useCallback(async () => {
    if (isProcessing) {
      throw new Error('Biometric operation already in progress');
    }

    const canUse = await canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    setIsProcessing(true);

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'PrimePost',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: 'user@primepost',
            displayName: 'PrimePost User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null;

      if (credential) {
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        localStorage.setItem(CREDENTIAL_ID_KEY, btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
        setIsEnabled(true);
      } else {
        throw new Error('Failed to create credential');
      }
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled');
      }
      throw new Error(error.message || 'Failed to enable biometric authentication');
    } finally {
      setIsProcessing(false);
    }
  }, [canUseBiometrics, isProcessing]);

  const verifyBiometrics = useCallback(async () => {
    if (isProcessing) {
      throw new Error('Biometric operation already in progress');
    }

    const canUse = await canUseBiometrics();
    if (!canUse || !isEnabled) {
      throw new Error('Biometric authentication is not available');
    }

    setIsProcessing(true);

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialIdBase64 = localStorage.getItem(CREDENTIAL_ID_KEY);
      if (!credentialIdBase64) {
        throw new Error('No credential found');
      }

      const credentialId = Uint8Array.from(atob(credentialIdBase64), c => c.charCodeAt(0));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: credentialId,
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (!assertion) {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled');
      }
      throw new Error(error.message || 'Biometric authentication failed');
    } finally {
      setIsProcessing(false);
    }
  }, [canUseBiometrics, isEnabled, isProcessing]);

  return {
    canUseBiometrics,
    isBiometricsEnabled,
    enableBiometrics,
    verifyBiometrics,
    isProcessing,
  };
}
