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

    // Check if content-type indicates HTML
    if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
      isHtml = true;
      errors.push(`Server is returning HTML/text (Content-Type: ${contentType}) instead of binary APK`);
    }

    // Check size
    if (size > 0 && size < 1048576) {
      errors.push(`File is too small (${formatBytes(size)}). Valid APK should be at least 1 MB`);
    }

    // Now fetch the first 2 bytes to verify PK header
    try {
      const rangeResponse = await fetch('/assets/primepost.apk', {
        headers: { 'Range': 'bytes=0-1' }
      });

      if (rangeResponse.ok) {
        const buffer = await rangeResponse.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        // Check for PK signature (0x50 0x4B)
        if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4B) {
          hasValidHeader = true;
        } else {
          errors.push(`Invalid APK signature. Expected PK header (0x50 0x4B), got: 0x${bytes[0]?.toString(16).padStart(2, '0')} 0x${bytes[1]?.toString(16).padStart(2, '0')}`);
        }
      } else {
        // If range request fails, try fetching first few bytes normally
        const fullResponse = await fetch('/assets/primepost.apk');
        const buffer = await fullResponse.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4B) {
          hasValidHeader = true;
        } else if (bytes.length < 2) {
          errors.push('File is empty or too small to verify');
        } else {
          errors.push(`Invalid APK signature. Expected PK header, got: 0x${bytes[0].toString(16).padStart(2, '0')} 0x${bytes[1].toString(16).padStart(2, '0')}`);
        }
        
        // Update size if we got it from full response
        if (bytes.length > 0) {
          size = bytes.length;
        }
      }
    } catch (headerError) {
      errors.push(`Failed to verify APK header: ${headerError instanceof Error ? headerError.message : 'Unknown error'}`);
    }

  } catch (error) {
    errors.push(`Failed to validate APK: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const isValid = hasValidHeader && !isHtml && size >= 1048576 && errors.length === 0;

  return {
    isValid,
    hasValidHeader,
    isHtml,
    contentType,
    size,
    errors,
  };
}

/**
 * Cross-checks deployed APK against metadata
 */
export async function verifyApkIntegrity(metadata: ApkMetadata): Promise<{ matches: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (!metadata.available) {
    errors.push('Metadata not available');
    return { matches: false, errors };
  }

  const validation = await validateDeployedApk();
  
  if (!validation.isValid) {
    errors.push(...validation.errors);
  }

  if (validation.size > 0 && validation.size !== metadata.size) {
    errors.push(`Size mismatch: metadata reports ${formatBytes(metadata.size)}, but deployed file is ${formatBytes(validation.size)}`);
  }

  return {
    matches: errors.length === 0,
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
    suspiciouslySmall: false,
  };
}

/**
 * Formats bytes into human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Verifies if a given size indicates a valid APK
 */
export function isValidApkSize(bytes: number): boolean {
  return bytes >= 1048576; // At least 1 MB
}
