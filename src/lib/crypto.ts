import crypto from 'crypto';

export function computeSha256(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Compute cryptographic hash for an inspection item
 */
export function computeItemHash(
  itemId: string,
  conditionRating: number,
  status: string,
  photoHashes: string[]
): string {
  const sortedPhotos = [...photoHashes].sort().join(',');
  const itemPayload = `ITEM:${itemId}|RATING:${conditionRating}|STATUS:${status}|PHOTOS:[${sortedPhotos}]`;
  return computeSha256(itemPayload);
}

/**
 * Compute chained hash for an entire inspection report
 */
export function computeReportChainedHash(
  reportNumber: string,
  lockedAtIsoString: string,
  itemHashes: string[]
): string {
  const sortedItemHashes = [...itemHashes].sort().join('::');
  const chainPayload = `DL-CERT:${reportNumber}|LOCKED:${lockedAtIsoString}|ITEMS:[${sortedItemHashes}]`;
  return computeSha256(chainPayload);
}

/**
 * Browser-friendly SHA-256 calculation for client uploads using Web Crypto API
 */
export async function computeClientFileHash(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
