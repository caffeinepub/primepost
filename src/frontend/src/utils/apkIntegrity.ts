export interface ApkMetadata {
  filename: string;
  size: number;
  sizeFormatted: string;
  sha256: string;
  available: boolean;
  suspiciouslySmall: boolean;
}

export interface ApkValidationResult {
  isValid: boolean;
  hasValidHeader: boolean;
  isHtml: boolean;
  contentType: string | null;
  size: number;
  errors: string[];
}

/**
 * Fetches and parses the APK metadata file
 * Returns metadata with available=false if fetch fails or metadata is invalid
 */
export async function getApkMetadata(): Promise<ApkMetadata> {
  try {
    const response = await fetch('/assets/primepost.apk.meta.json');
    if (!response.ok) {
      return createUnavailableMetadata();
    }
    const data = await response.json();
    
    // Validate that we have actual metadata
    if (!data || typeof data.size !== 'number') {
      return createUnavailableMetadata();
    }
    
    const suspiciouslySmall = data.size < 1048576; // Less than 1 MB
    
    return {
      filename: data.filename || 'primepost.apk',
      size: data.size,
      sizeFormatted: formatBytes(data.size),
      sha256: data.sha256 || 'unavailable',
      available: true,
      suspiciouslySmall,
    };
  } catch (error) {
    console.error('Failed to fetch APK metadata:', error);
    return createUnavailableMetadata();
  }
}

/**
 * Validates the deployed APK by checking its header and content type
 * This helps detect if the server is serving HTML instead of the binary APK
 * 
 * Updated to treat only HTML/text content types as invalid, and accept
 * common binary APK content types including application/vnd.android.package-archive
 * and application/octet-stream
 */
export async function validateDeployedApk(): Promise<ApkValidationResult> {
  const errors: string[] = [];
  let hasValidHeader = false;
  let isHtml = false;
  let contentType: string | null = null;
  let size = 0;

  try {
    // First, do a HEAD request to check content-type and size without downloading the whole file
    const headResponse = await fetch('/assets/primepost.apk', { method: 'HEAD' });
    contentType = headResponse.headers.get('content-type');
    const contentLength = headResponse.headers.get('content-length');
    
    if (contentLength) {
      size = parseInt(contentLength, 10);
    }

    // Check if content-type indicates HTML or plain text (invalid for APK)
    // Accept: application/vnd.android.package-archive, application/octet-stream, or any binary type
    // Reject: text/html, text/plain
    if (contentType) {
      const lowerContentType = contentType.toLowerCase();
      if (lowerContentType.includes('text/html') || lowerContentType.includes('text/plain')) {
        isHtml = true;
        errors.push(`Server is returning HTML/text (Content-Type: ${contentType}) instead of binary APK`);
      }
    }

    // Check size - must be at least 1 MB
    if (size > 0 && size < 1048576) {
      errors.push(`File is too small (${size} Bytes). Valid APK should be at least 1 MB`);
    }

    // Now fetch the first 2 bytes to verify PK header
    // Try range request first (more efficient), fall back to full fetch if needed
    try {
      let bytes: Uint8Array | null = null;
      
      // Try range request
      const rangeResponse = await fetch('/assets/primepost.apk', {
        headers: { 'Range': 'bytes=0-1' }
      });
      
      if (rangeResponse.ok && rangeResponse.status === 206) {
        // Partial content response
        const buffer = await rangeResponse.arrayBuffer();
        bytes = new Uint8Array(buffer);
      } else {
        // Range not supported, fetch full file (or at least start of it)
        const fullResponse = await fetch('/assets/primepost.apk');
        const buffer = await fullResponse.arrayBuffer();
        bytes = new Uint8Array(buffer.slice(0, 2));
      }

      // Check for PK header (0x50 0x4B)
      if (bytes && bytes.length >= 2) {
        hasValidHeader = bytes[0] === 0x50 && bytes[1] === 0x4B;
        
        if (!hasValidHeader) {
          const hexBytes = Array.from(bytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
          errors.push(`Invalid APK signature. Expected PK header (0x50 0x4B), got: ${hexBytes}`);
        }
      } else {
        errors.push('Could not read APK header bytes');
      }
    } catch (fetchError) {
      errors.push(`Failed to fetch APK for header validation: ${fetchError}`);
    }

  } catch (error) {
    errors.push(`Validation failed: ${error}`);
  }

  const isValid = errors.length === 0 && hasValidHeader && !isHtml;

  return {
    isValid,
    hasValidHeader,
    isHtml,
    contentType,
    size,
    errors,
  };
}

function createUnavailableMetadata(): ApkMetadata {
  return {
    filename: 'primepost.apk',
    size: 0,
    sizeFormatted: 'Unknown',
    sha256: 'unavailable',
    available: false,
    suspiciouslySmall: true,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
