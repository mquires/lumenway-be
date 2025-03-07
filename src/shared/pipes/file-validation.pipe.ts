import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ReadStream } from 'fs';

import { validateFileFormat, validateFileSize } from '../utils/file.util';

interface FileUpload {
  filename: string;
  createReadStream: () => ReadStream;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
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
      10 * 1024 * 1024,
    );

    if (!isFileSizeValid) {
      throw new BadRequestException('File size exceeds 10 MB');
    }

    return value;
  }
}
