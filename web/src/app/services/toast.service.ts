import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslationService } from './translation.service';

export interface ToastData {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private translationService = inject(TranslationService, { optional: true });

  private toastSubject = new BehaviorSubject<ToastData>({
    show: false,
    message: '',
    type: 'success',
    title: ''
  });

  toast$ = this.toastSubject.asObservable();
  private timeoutRef: any;

  private titleMapTaToEn: Record<string, string> = {
    'வெற்றி': 'Success',
    'வெற்றி (Success)': 'Success',
    'வெற்றிகரமாக வெளியிடப்பட்டது': 'Published Successfully',
    'பிழை': 'Error',
    'பிழை (Error)': 'Error',
    'பிழை ஏற்பட்டது': 'An Error Occurred',
    'எச்சரிக்கை': 'Warning',
    'எச்சரிக்கை (Warning)': 'Warning',
    'தகவல்': 'Information',
    'தகவல் (Info)': 'Information',
    'பதிவேற்றப் பிழை': 'Upload Failed',
    'கோப்பு அளவு அதிகம்': 'File Too Large',
    'நீக்கப்பட்டது': 'Deleted Successfully',
    'பதிவு நீக்கப்பட்டது': 'Deleted Successfully',
    'பதிவு உருவாக்கப்பட்டது': 'Created Successfully',
    'ஆலோசனை நிலை புதுப்பிக்கப்பட்டது': 'Status Updated',
    'விவரங்கள் தேவை': 'Required Info Missing',
    'பேட்ச் பெயர் அவசியம்': 'Batch Name Required',
    'பேட்ச் உருவாக்கப்பட்டது': 'Batch Created',
    'மாணவர் பேட்ச் மாற்றப்பட்டது': 'Batch Shifted',
    'பேனர் சேமிக்கப்பட்டது': 'Banner Saved',
    'ஆடியோ இயக்க முடியவில்லை': 'Audio Playback Failed',
    'மாணவர்கள் எவரும் இல்லை': 'No Students Found',
    'உறுப்பினர்கள் எவரும் இல்லை': 'No Members Found',
    'மாணவர் அறிக்கை பதிவிறக்கப்பட்டது': 'Students Report Downloaded',
    'உறுப்பினர் பட்டியல் பதிவிறக்கப்பட்டது': 'Members Directory Downloaded'
  };

  private titleMapEnToTa: Record<string, string> = {
    'Success': 'வெற்றி',
    'Error': 'பிழை',
    'Warning': 'எச்சரிக்கை',
    'Info': 'தகவல்',
    'Information': 'தகவல்',
    'Export CSV Success': 'அறிக்கை பதிவிறக்கப்பட்டது',
    'Audio upload failed.': 'ஆடியோ பதிவேற்றம் தோல்வியடைந்தது',
    'Video upload failed.': 'வீடியோ பதிவேற்றம் தோல்வியடைந்தது',
    'Failed to save': 'சேமிக்க முடியவில்லை',
    'Upload Failed': 'பதிவேற்றப் பிழை',
    'File Too Large': 'கோப்பு அளவு அதிகம்',
    'Published Successfully': 'வெற்றிகரமாக வெளியிடப்பட்டது'
  };

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string, duration = 3800): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    const isTa = this.translationService ? this.translationService.currentLanguage() === 'ta' : true;

    let cleanTitle = title?.trim() || '';

    // If title has bracketed text e.g. "வெற்றி (Success)"
    if (cleanTitle.includes('(') && cleanTitle.includes(')')) {
      if (isTa) {
        cleanTitle = cleanTitle.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();
      } else {
        const match = cleanTitle.match(/\(([A-Za-z\s0-9#\-_:]+)\)/);
        cleanTitle = match && match[1] ? match[1].trim() : cleanTitle;
      }
    }

    // Now if language is English but title is still Tamil, translate it
    if (!isTa && cleanTitle) {
      if (this.titleMapTaToEn[cleanTitle]) {
        cleanTitle = this.titleMapTaToEn[cleanTitle];
      }
    } else if (isTa && cleanTitle) {
      if (this.titleMapEnToTa[cleanTitle]) {
        cleanTitle = this.titleMapEnToTa[cleanTitle];
      }
    }

    // If title is empty, use defaults for type
    if (!cleanTitle) {
      if (isTa) {
        cleanTitle = (
          type === 'success' ? 'வெற்றி' :
          type === 'error' ? 'பிழை' :
          type === 'warning' ? 'எச்சரிக்கை' : 'தகவல்'
        );
      } else {
        cleanTitle = (
          type === 'success' ? 'Success' :
          type === 'error' ? 'Error' :
          type === 'warning' ? 'Warning' : 'Information'
        );
      }
    }

    // Clean or translate message
    let cleanMessage = message || '';
    if (cleanMessage.includes('(') && cleanMessage.includes(')')) {
      if (isTa) {
        cleanMessage = cleanMessage.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();
      } else {
        const match = cleanMessage.match(/\(([A-Za-z\s0-9#\-_:,.!]+)\)/);
        if (match && match[1] && /[A-Za-z]{3,}/.test(match[1])) {
          cleanMessage = match[1].trim();
        }
      }
    }

    this.toastSubject.next({
      show: true,
      message: cleanMessage,
      type,
      title: cleanTitle,
      duration
    });

    this.timeoutRef = setTimeout(() => {
      this.hide();
    }, duration);
  }

  success(message: string, title?: string): void {
    this.show(message, 'success', title);
  }

  error(message: string, title?: string): void {
    this.show(message, 'error', title);
  }

  info(message: string, title?: string): void {
    this.show(message, 'info', title);
  }

  warning(message: string, title?: string): void {
    this.show(message, 'warning', title);
  }

  hide(): void {
    const curr = this.toastSubject.getValue();
    this.toastSubject.next({ ...curr, show: false });
  }
}
