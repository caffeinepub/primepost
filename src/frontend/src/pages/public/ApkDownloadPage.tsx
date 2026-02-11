import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CheckCircle, ArrowLeft, AlertCircle, FileCheck, AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApkMetadata, validateDeployedApk, type ApkMetadata, type ApkValidationResult } from '@/utils/apkIntegrity';

export default function ApkDownloadPage() {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState<ApkMetadata | null>(null);
  const [validation, setValidation] = useState<ApkValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Fetch metadata and validate deployed APK in parallel
    Promise.all([
      getApkMetadata(),
      validateDeployedApk()
    ])
      .then(([metaData, validationResult]) => {
        setMetadata(metaData);
        setValidation(validationResult);
        setIsLoading(false);
        setIsValidating(false);
      })
      .catch(() => {
        setIsLoading(false);
        setIsValidating(false);
      });
  }, []);

  const isBrokenApk = validation && (!validation.isValid || validation.isHtml || !validation.hasValidHeader);
  const isMetadataUnavailable = !isLoading && (!metadata || !metadata.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <img 
            src="/assets/generated/primepost-logo.dim_512x512.png" 
            alt="PrimePost" 
            className="w-24 h-24 mx-auto mb-4" 
          />
          <CardTitle className="text-3xl">Download PrimePost for Android</CardTitle>
          <CardDescription className="text-base">
            Get the PrimePost mobile app and enjoy seamless ordering on the go
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Critical error: APK is HTML or has invalid header */}
          {isBrokenApk && validation && (
            <Alert className="border-destructive bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="space-y-3">
                <p className="font-bold text-lg">⚠️ CRITICAL: APK FILE IS NOT VALID</p>
                
                {validation.isHtml && (
                  <div className="space-y-1">
                    <p className="font-semibold">The server is returning an HTML page instead of the APK binary.</p>
                    <p className="text-sm">Content-Type: <code className="bg-destructive/20 px-1 rounded">{validation.contentType}</code></p>
                  </div>
                )}
                
                {!validation.hasValidHeader && (
                  <div className="space-y-1">
                    <p className="font-semibold">The file does not have a valid APK signature (missing PK header).</p>
                    <p className="text-sm">This means the file is not a valid Android APK package.</p>
                  </div>
                )}
                
                {validation.size > 0 && validation.size < 1048576 && (
                  <div className="space-y-1">
                    <p className="font-semibold">The file is too small: {validation.size} bytes</p>
                    <p className="text-sm">A valid PrimePost APK should be 5-10 MB (at least 1 MB).</p>
                  </div>
                )}

                {validation.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-semibold">Validation Errors:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="font-bold mt-3">
                  ❌ DO NOT ATTEMPT TO DOWNLOAD OR INSTALL THIS FILE
                </p>
                
                <p className="text-sm">
                  Installing this file will fail with: <strong>"There was a problem parsing the package."</strong>
                </p>
                
                <div className="bg-destructive/20 p-3 rounded mt-3">
                  <p className="font-semibold">What this means:</p>
                  <p className="text-sm">
                    The APK was not properly deployed to the server. The deployment process likely failed to copy 
                    the actual Android application binary, and instead the server is serving an error page or placeholder file.
                  </p>
                </div>
                
                <p className="font-semibold mt-3">
                  Please contact support at <a href="mailto:PrimePost7@gmail.com" className="underline">PrimePost7@gmail.com</a> and 
                  report this deployment issue.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Metadata unavailable warning */}
          {isMetadataUnavailable && !isBrokenApk && !isValidating && (
            <Alert className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>Notice:</strong> APK metadata is currently unavailable. The download link is still available, but we cannot verify the file size or integrity at this time. If the download is very small (less than 1 MB), do not install it. Please try again later or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {/* Validation in progress */}
          {isValidating && (
            <Alert>
              <AlertCircle className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                Validating APK file integrity...
              </AlertDescription>
            </Alert>
          )}

          {/* Success: Valid APK */}
          {!isBrokenApk && validation?.isValid && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <strong>✅ APK Verified:</strong> The file has been validated and is ready for download.
              </AlertDescription>
            </Alert>
          )}

          {/* File information - always show when metadata or validation is available */}
          {(metadata?.available || validation) && (
            <div className={`rounded-lg p-4 space-y-2 ${isBrokenApk ? 'bg-destructive/5 border border-destructive' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileCheck className={`w-4 h-4 ${isBrokenApk ? 'text-destructive' : 'text-primary'}`} />
                <span>File Information</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {metadata?.available && (
                  <>
                    <p><span className="font-medium">Filename:</span> {metadata.filename}</p>
                    <p>
                      <span className="font-medium">Expected Size:</span> {metadata.sizeFormatted}
                      {metadata.suspiciouslySmall && <span className="text-destructive font-bold ml-2">⚠️ TOO SMALL</span>}
                    </p>
                    {metadata.sha256 && metadata.sha256 !== 'unavailable' && (
                      <p className="break-all"><span className="font-medium">SHA-256:</span> {metadata.sha256}</p>
                    )}
                  </>
                )}
                {validation && (
                  <>
                    <p>
                      <span className="font-medium">Deployed Size:</span> {validation.size > 0 ? `${(validation.size / 1024 / 1024).toFixed(2)} MB (${validation.size.toLocaleString()} bytes)` : 'Unknown'}
                    </p>
                    <p>
                      <span className="font-medium">Content-Type:</span> {validation.contentType || 'Unknown'}
                      {validation.isHtml && <span className="text-destructive font-bold ml-2">⚠️ HTML DETECTED</span>}
                    </p>
                    <p>
                      <span className="font-medium">APK Signature:</span> {validation.hasValidHeader ? '✅ Valid (PK header)' : '❌ Invalid'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Download button - disabled if broken */}
          <div className="flex justify-center">
            <a 
              href="/assets/primepost.apk" 
              download="primepost.apk"
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold transition shadow-lg text-lg ${
                isBrokenApk 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
              }`}
              onClick={(e) => {
                if (isBrokenApk) {
                  e.preventDefault();
                  alert('This APK file is broken and cannot be installed. The server is not serving a valid APK binary. Please contact support.');
                }
              }}
            >
              <Download className="w-6 h-6" />
              {isBrokenApk ? 'Download Blocked (Invalid File)' : 'Download APK'}
            </a>
          </div>

          {/* General installation warning for valid or unknown APKs */}
          {!isBrokenApk && !isValidating && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> After downloading, verify the file size is at least 1 MB (ideally 5-10 MB). 
                If the downloaded file is extremely small (e.g., 405 bytes or a few KB), it's likely an error page, not the actual APK. 
                Installing such a file will fail with "There was a problem parsing the package." 
                In that case, please contact support or try downloading from a different browser.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Installation Instructions</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 1: Enable Unknown Sources</p>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → Security → Enable "Install from Unknown Sources"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 2: Download the APK</p>
                  <p className="text-sm text-muted-foreground">
                    Click the download button above to save the APK file (should be 5-10 MB)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 3: Verify File Size</p>
                  <p className="text-sm text-muted-foreground">
                    Check that the downloaded file is at least 1 MB. If it's only a few bytes or KB, do not install it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 4: Install the App</p>
                  <p className="text-sm text-muted-foreground">
                    Open the downloaded APK file and follow the installation prompts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Step 5: Launch PrimePost</p>
                  <p className="text-sm text-muted-foreground">
                    Open the app and sign in to start ordering
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact us at <a href="mailto:PrimePost7@gmail.com" className="underline">PrimePost7@gmail.com</a></p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
