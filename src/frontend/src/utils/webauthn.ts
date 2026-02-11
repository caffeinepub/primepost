export async function isWebAuthnAvailable(): Promise<boolean> {
  return !!(window.PublicKeyCredential && navigator.credentials);
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function createCredential(challenge: BufferSource) {
  if (!await isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not supported');
  }

  const platformAvailable = await isPlatformAuthenticatorAvailable();
  if (!platformAvailable) {
    throw new Error('Platform authenticator is not available');
  }

  try {
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
    });

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    return credential as PublicKeyCredential;
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('User cancelled the operation');
    }
    throw error;
  }
}

export async function getCredential(challenge: BufferSource, credentialId: BufferSource) {
  if (!await isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not supported');
  }

  try {
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

    return assertion as PublicKeyCredential;
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('User cancelled the operation');
    }
    throw error;
  }
}
