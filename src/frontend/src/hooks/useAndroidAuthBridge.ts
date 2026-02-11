import { useCallback, useEffect, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Android WebView detection and auth bridge helper
 * Provides safe login initiation for Android wrapper context
 */
export function useAndroidAuthBridge() {
  const { login: originalLogin, loginStatus, loginError } = useInternetIdentity();
  const [isAndroid, setIsAndroid] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Detect Android WebView context
  useEffect(() => {
    const checkAndroid = () => {
      // Check for Android WebView flag injected by MainActivity
      const isAndroidWebView = !!(window as any).isAndroidWebView;
      setIsAndroid(isAndroidWebView);
    };

    checkAndroid();
    // Re-check after a short delay in case the flag is injected after mount
    const timer = setTimeout(checkAndroid, 100);
    return () => clearTimeout(timer);
  }, []);

  // Wrap login with Android-specific handling
  const login = useCallback(() => {
    setAuthError(null);
    
    try {
      originalLogin();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      if (isAndroid) {
        // Provide Android-specific guidance
        if (errorMessage.includes('already authenticated')) {
          setAuthError('You are already logged in. Please log out first if you want to switch accounts.');
        } else {
          setAuthError('Authentication failed. The login will open in your browser. Please complete the login and return to the app.');
        }
      } else {
        setAuthError(errorMessage);
      }
    }
  }, [originalLogin, isAndroid]);

  // Clear error when login status changes
  useEffect(() => {
    if (loginStatus === 'success') {
      setAuthError(null);
    }
  }, [loginStatus]);

  return {
    login,
    loginStatus,
    isAndroid,
    authError: authError || (loginError ? loginError.message : null),
    clearError: () => setAuthError(null),
  };
}
