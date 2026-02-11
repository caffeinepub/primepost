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

  return credential as PublicKeyCredential;
}

export async function getCredential(challenge: BufferSource, credentialId: BufferSource) {
  if (!await isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not supported');
  }

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

  return assertion as PublicKeyCredential;
}
