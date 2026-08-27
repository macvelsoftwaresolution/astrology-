import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LanguageCode = 'ta' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSignal = signal<LanguageCode>('ta');
  public currentLanguage = computed(() => this.currentLanguageSignal());

  // Version signal to force dirty checking when translation files are loaded
  public version = signal<number>(1);

  // Dynamic runtime translation store populated from public/assets/i18n/ JSON files
  private translations: Record<LanguageCode, Record<string, any>> = {
    ta: {},
    en: {}
  };

  constructor(private http: HttpClient) {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = sessionStorage.getItem('astro_admin_lang') as LanguageCode;
      if (savedLang === 'ta' || savedLang === 'en') {
        this.currentLanguageSignal.set(savedLang);
      }
    }
    this.loadTranslations('ta');
    this.loadTranslations('en');
  }

  public loadTranslations(lang: LanguageCode): void {
    if (typeof window === 'undefined') return;
    this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        if (data && Object.keys(data).length > 0) {
          this.translations[lang] = this.deepMerge(this.translations[lang], data);
          this.version.update((v) => v + 1);
        }
      },
      error: () => {}
    });
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...(target || {}) };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  public setLanguage(lang: LanguageCode): void {
    if (lang !== 'ta' && lang !== 'en') return;
    this.currentLanguageSignal.set(lang);
    if (!this.translations[lang] || Object.keys(this.translations[lang]).length === 0) {
      this.loadTranslations(lang);
    }
    this.version.update((v) => v + 1);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('astro_admin_lang', lang);
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguageSignal() === 'ta' ? 'en' : 'ta';
    this.setLanguage(next);
  }

  public translate(key: string, fallback?: string): string {
    // Reading version creates reactive dependency if inside signal context
    this.version();
    const lang = this.currentLanguageSignal();
    const data = this.translations[lang] || {};

    // Support dot-notation keys: e.g. "nav.overview", "services.title"
    const keys = key.split('.');
    let result: any = data;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined && typeof result === 'string') {
      return result;
    }

    // Fallback to English if not found in Tamil
    if (lang !== 'en' && this.translations['en']) {
      let enResult: any = this.translations['en'];
      for (const k of keys) {
        if (enResult && typeof enResult === 'object' && k in enResult) {
          enResult = enResult[k];
        } else {
          enResult = undefined;
          break;
        }
      }
      if (enResult !== undefined && typeof enResult === 'string') {
        return enResult;
      }
    }

    // Fallback to Tamil if not found in English
    if (lang !== 'ta' && this.translations['ta']) {
      let taResult: any = this.translations['ta'];
      for (const k of keys) {
        if (taResult && typeof taResult === 'object' && k in taResult) {
          taResult = taResult[k];
        } else {
          taResult = undefined;
          break;
        }
      }
      if (taResult !== undefined && typeof taResult === 'string') {
        return taResult;
      }
    }

    if (fallback !== undefined) {
      return fallback;
    }

    // Try dynamic translation for non-key strings
    return this.translateDynamic(key);
  }

  public translateDynamic(text: string): string {
    if (!text || typeof text !== 'string') return '';
    const lang = this.currentLanguageSignal();

    if (lang === 'ta') {
      // PURE TAMIL MODE
      let res = text;
      // Strip any English in brackets e.g. (Booking Completed), (Booking Received), (General), etc.
      res = res.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();

      // Common dynamic backend strings to Tamil
      const map: Record<string, string> = {
        'booking_fulfilled': 'ஆலோசனை நிறைவுற்றது',
        'booking': 'ஜோதிட முன்பதிவு',
        'book_order': 'புத்தக ஆர்டர்',
        'matrimony_registration': 'சுயவரப் பதிவு',
        'marriage_match': 'திருமணப் பொருத்தம்',
        'user_registration': 'பயனர் பதிவு',
        'submission': 'தேர்வு சமர்ப்பிப்பு',
        'general': 'பொது அறிவிப்பு',
        'All Users': 'அனைத்து பயனர்கள்',
        'Students Only': 'மாணவர்கள் மட்டும்',
        'Shipped': 'அனுப்பி வைக்கப்பட்டது',
        'Packed': 'பேக் செய்யப்பட்டது',
        'Processing': 'செயலாக்கத்தில் உள்ளது',
        'Delivered': 'விநியோகிக்கப்பட்டது',
        'Pending': 'காத்திருப்பில்',
        'Completed': 'நிறைவுற்றது',
        'Active': 'செயலில் உள்ளது',
        'Cancelled': 'ரத்து செய்யப்பட்டது'
      };

      if (map[res]) return map[res];

      res = res.replace(/புத்தக ஆர்டர் நிலை:\s*Shipped/gi, 'புத்தக ஆர்டர் நிலை: அனுப்பி வைக்கப்பட்டது')
               .replace(/புத்தக ஆர்டர் நிலை:\s*Packed/gi, 'புத்தக ஆர்டர் நிலை: பேக் செய்யப்பட்டது')
               .replace(/புத்தக ஆர்டர் நிலை:\s*Processing/gi, 'புத்தக ஆர்டர் நிலை: செயலாக்கத்தில் உள்ளது')
               .replace(/புத்தக ஆர்டர் நிலை:\s*Delivered/gi, 'புத்தக ஆர்டர் நிலை: விநியோகிக்கப்பட்டது')
               .replace(/நிலை:\s*Shipped/gi, 'நிலை: அனுப்பி வைக்கப்பட்டது')
               .replace(/நிலை:\s*Packed/gi, 'நிலை: பேக் செய்யப்பட்டது')
               .replace(/நிலை:\s*Processing/gi, 'நிலை: செயலாக்கத்தில் உள்ளது')
               .replace(/நிலை:\s*Delivered/gi, 'நிலை: விநியோகிக்கப்பட்டது')
               .replace(/Batch\s*1/gi, 'பிரிவு 1')
               .replace(/Batch\s*2/gi, 'பிரிவு 2')
               .replace(/Batch\s*3/gi, 'பிரிவு 3')
               .replace(/Batch\s*4/gi, 'பிரிவு 4')
               .replace(/Batch\s*A/gi, 'பிரிவு A')
               .replace(/Batch\s*B/gi, 'பிரிவு B')
               .replace(/Batch\s*C/gi, 'பிரிவு C')
               .replace(/Batch\s*D/gi, 'பிரிவு D')
               .replace(/Jan\s*-\s*Mar/gi, 'ஜன - மார்')
               .replace(/Apr\s*-\s*Jun/gi, 'ஏப் - ஜூன்')
               .replace(/Jul\s*-\s*Sep/gi, 'ஜூலை - செப்')
               .replace(/Oct\s*-\s*Dec/gi, 'அக் - டிச')
               .replace(/Feb\s*-\s*Apr/gi, 'பிப் - ஏப்')
               .replace(/May\s*-\s*Jul/gi, 'மே - ஜூலை')
               .replace(/Aug\s*-\s*Oct/gi, 'ஆக - அக்')
               .replace(/Nov\s*-\s*Jan/gi, 'நவ - ஜன');

      return res;
    } else {
      // PURE ENGLISH MODE
      let res = text;
      if (res.includes('Booking Completed') || res.includes('ஜோதிட கணிப்பு நிறைவுற்றது')) {
        return 'Astrology Prediction Completed!';
      }
      if (res.includes('Booking Received') || res.includes('முன்பதிவு பெறப்பட்டது')) {
        return 'Booking Received!';
      }
      if (res.includes('புத்தக ஆர்டர் நிலை')) {
        res = res.replace(/புத்தக ஆர்டர் நிலை:\s*அனுப்பி வைக்கப்பட்டது/gi, 'Book Order Status: Shipped')
                 .replace(/புத்தக ஆர்டர் நிலை:\s*பேக் செய்யப்பட்டது/gi, 'Book Order Status: Packed')
                 .replace(/புத்தக ஆர்டர் நிலை:\s*செயலாக்கத்தில் உள்ளது/gi, 'Book Order Status: Processing')
                 .replace(/புத்தக ஆர்டர் நிலை:\s*விநியோகிக்கப்பட்டது/gi, 'Book Order Status: Delivered')
                 .replace(/புத்தக ஆர்டர் நிலை:\s*/gi, 'Book Order Status: ');
        return res;
      }
      if (res.includes('புத்தக ஆர்டர் பெறப்பட்டது')) {
        return 'Book Order Received!';
      }

      // Batch & month translation in English
      res = res.replace(/பிரிவு\s*1/gi, 'Batch 1')
               .replace(/பிரிவு\s*2/gi, 'Batch 2')
               .replace(/பிரிவு\s*3/gi, 'Batch 3')
               .replace(/பிரிவு\s*4/gi, 'Batch 4')
               .replace(/பிரிவு\s*A/gi, 'Batch A')
               .replace(/பிரிவு\s*B/gi, 'Batch B')
               .replace(/பிரிவு\s*C/gi, 'Batch C')
               .replace(/பிரிவு\s*D/gi, 'Batch D')
               .replace(/ஜன\s*-\s*மார்/gi, 'Jan - Mar')
               .replace(/ஏப்\s*-\s*ஜூன்/gi, 'Apr - Jun')
               .replace(/ஜூலை\s*-\s*செப்/gi, 'Jul - Sep')
               .replace(/அக்\s*-\s*டிச/gi, 'Oct - Dec')
               .replace(/பிப்\s*-\s*ஏப்/gi, 'Feb - Apr')
               .replace(/மே\s*-\s*ஜூலை/gi, 'May - Jul')
               .replace(/ஆக\s*-\s*அக்/gi, 'Aug - Oct')
               .replace(/நவ\s*-\s*ஜன/gi, 'Nov - Jan');

      const map: Record<string, string> = {
        'booking_fulfilled': 'Booking Completed',
        'booking': 'Astrology Booking',
        'book_order': 'Book Order',
        'matrimony_registration': 'Matrimony Profile',
        'marriage_match': 'Marriage Match',
        'user_registration': 'User Registration',
        'submission': 'Exam Submission',
        'general': 'General Announcement',
        'All Users': 'All Users',
        'அனைத்து பயனர்கள்': 'All Users',
        'மாணவர்கள் மட்டும்': 'Students Only',
        'செயலாக்கத்தில் உள்ளது': 'Processing',
        'பேக் செய்யப்பட்டது': 'Packed',
        'அனுப்பி வைக்கப்பட்டது': 'Shipped',
        'விநியோகிக்கப்பட்டது': 'Delivered',
        'காத்திருப்பில்': 'Pending',
        'நிறைவுற்றது': 'Completed',
        'செயலில் உள்ளது': 'Active',
        'ரத்து செய்யப்பட்டது': 'Cancelled'
      };

      if (map[res]) return map[res];

      // Message body translation
      if (res.includes('உங்கள் முன்பதிவு') && res.includes('ஜோதிடரால் ஆய்வு செய்யப்பட்டு')) {
        return 'Your booking has been reviewed and completed by the astrologer. Your horoscope chart file is attached below.';
      }
      if (res.includes('உங்கள்') && res.includes('முன்பதிவு') && res.includes('பெறப்பட்டது')) {
        return res.replace(/உங்கள்/g, 'Your')
                  .replace(/முன்பதிவு/g, 'booking')
                  .replace(/பெறப்பட்டது\./g, 'has been received.');
      }
      if (res.includes('உங்கள்') && res.includes('புத்தக ஆர்டர்') && res.includes('நிலை')) {
        return res.replace(/உங்கள்/g, 'Your')
                  .replace(/புத்தக ஆர்டர்/g, 'book order')
                  .replace(/நிலை:/g, 'status:');
      }

      return res;
    }
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
