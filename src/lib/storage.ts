import fs from 'fs';
import path from 'path';

export interface SavedFileResult {
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<SavedFileResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const extension = path.extname(originalFilename) || (mimeType.includes('png') ? '.png' : '.jpg');
  const safeBase = path.basename(originalFilename, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${Date.now()}-${safeBase}${extension}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${uniqueName}`,
    fileSize: fileBuffer.length,
    mimeType: mimeType || 'image/jpeg',
  };
}
