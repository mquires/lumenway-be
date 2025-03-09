import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ReadStream } from 'fs';

import { validateFileFormat, validateFileSize } from '../utils/file.util';

interface FileUpload {
  filename: string;
  createReadStream: () => ReadStream;
}

/**
 * Pipe for validating file uploads
 * Checks file format and size constraints
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  /**
   * Validates uploaded file
   * @param value - File upload object containing filename and stream
   * @throws BadRequestException if file is invalid
   * @returns Original file upload object if validation passes
   */
  public async transform(value: FileUpload) {
    if (!value.filename) {
      throw new BadRequestException('File not uploaded');
    }

    const { filename, createReadStream } = value;
    const fileStream = createReadStream();

    const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const isFileFormatValid = validateFileFormat(filename, allowedFormats);

    if (!isFileFormatValid) {
      throw new BadRequestException('Unsupported file format');
    }

    const isFileSizeValid = await validateFileSize(
      fileStream,
      10 * 1024 * 1024, // 10MB limit
    );

    if (!isFileSizeValid) {
      throw new BadRequestException('File size exceeds 10 MB');
    }

    return value;
  }
}
