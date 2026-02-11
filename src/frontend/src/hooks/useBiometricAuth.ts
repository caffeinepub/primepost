import { useState, useCallback } from 'react';

const BIOMETRIC_ENABLED_KEY = 'primepost_biometric_enabled';
const CREDENTIAL_ID_KEY = 'primepost_credential_id';

export function useBiometricAuth() {
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
  });

  const canUseBiometrics = useCallback((): boolean => {
    return !!(window.PublicKeyCredential && navigator.credentials);
  }, []);

  const isBiometricsEnabled = useCallback((): boolean => {
    return isEnabled;
  }, [isEnabled]);

  const enableBiometrics = useCallback(async () => {
    if (!canUseBiometrics()) {
      throw new Error('Biometric authentication is not supported on this device');
    }

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
      }) as PublicKeyCredential;

      if (credential) {
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        localStorage.setItem(CREDENTIAL_ID_KEY, btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
        setIsEnabled(true);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to enable biometric authentication');
    }
  }, [canUseBiometrics]);

  const verifyBiometrics = useCallback(async () => {
    if (!canUseBiometrics() || !isEnabled) {
      throw new Error('Biometric authentication is not available');
    }

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
      throw new Error(error.message || 'Biometric authentication failed');
    }
  }, [canUseBiometrics, isEnabled]);

  return {
    canUseBiometrics,
    isBiometricsEnabled,
    enableBiometrics,
    verifyBiometrics,
  };
}
