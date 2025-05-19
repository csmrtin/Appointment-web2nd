import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: Date | string, format: string = 'yyyy. MM. dd.'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return 'Érvénytelen Dátum';
    }

    return formatDate(date, format, 'hu-HU');
  }
} 