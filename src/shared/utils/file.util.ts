import { ReadStream } from 'fs';

/**
 * Checks if file extension is in allowed formats
 * @param filename - Name of uploaded file
 * @param allowedFileFormats - List of allowed extensions
 * @returns true if format is allowed
 */
export const validateFileFormat = (
  filename: string,
  allowedFileFormats: string[],
) => {
  const fileParts = filename.split('.');
  const extension = fileParts[fileParts.length - 1];

  return allowedFileFormats.includes(extension);
};

/**
 * Validates file size against maximum allowed size
 * @param fileStream - File read stream
 * @param allowedFileSizeInBytes - Maximum allowed size in bytes
 * @returns Promise resolving to true if size is within limit
 */
export const validateFileSize = (
  fileStream: ReadStream,
  allowedFileSizeInBytes: number,
) => {
  return new Promise((resolve, reject) => {
    let fileSizeInBytes = 0;

    fileStream
      .on('data', (data: Buffer) => {
        fileSizeInBytes = data.byteLength;
      })
      .on('end', () => {
        resolve(fileSizeInBytes <= allowedFileSizeInBytes);
      })
      .on('error', error => {
        reject(error);
      });
  });
};
