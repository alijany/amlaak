import { Injectable, PipeTransform } from '@nestjs/common';
import _ from 'lodash';

@Injectable()
export class NormalizeNumbersPipe implements PipeTransform {
  transform(value: any) {
    return _.cloneDeepWith(value, (val) => {
      if (typeof val === 'string') {
        return normalizeNumbers(val);
      }
    });
  }
}

export function normalizeNumbers(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // Persian
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)); // Arabic
}
