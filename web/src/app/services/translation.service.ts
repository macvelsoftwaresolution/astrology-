import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LanguageCode = 'ta' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSignal = signal<LanguageCode>('ta');
  public currentLanguage = computed(() => this.currentLanguageSignal());

  private translations: Record<LanguageCode, Record<string, any>> = {
    ta: {},
    en: {}
  };

  constructor(private http: HttpClient) {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('astro_admin_lang') as LanguageCode;
      if (savedLang === 'ta' || savedLang === 'en') {
        this.currentLanguageSignal.set(savedLang);
      }
    }
    this.loadTranslations('ta');
    this.loadTranslations('en');
  }

  public loadTranslations(lang: LanguageCode): void {
    this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations[lang] = data || {};
      },
      error: () => {
        // Fallback embedded translations are already available if needed
      }
    });
  }

  public setLanguage(lang: LanguageCode): void {
    this.currentLanguageSignal.set(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astro_admin_lang', lang);
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguageSignal() === 'ta' ? 'en' : 'ta';
    this.setLanguage(next);
  }

  public translate(key: string, fallback?: string): string {
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

    return fallback !== undefined ? fallback : key;
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}
