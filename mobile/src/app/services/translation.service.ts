import { Injectable, signal, computed, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LanguageCode = 'ta' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSignal = signal<LanguageCode>('ta');
  public currentLanguage = computed(() => this.currentLanguageSignal());
  public version = signal<number>(1);

  private translations: Record<LanguageCode, Record<string, any>> = {
    ta: {},
    en: {}
  };

  constructor(@Optional() private http?: HttpClient) {
    this.initLanguage();
    this.loadJsonTranslations();
  }

  private loadJsonTranslations(): void {
    if (!this.http) return;
    ['ta', 'en'].forEach((lang) => {
      this.http!.get<any>(`assets/i18n/${lang}.json`).subscribe({
        next: (json) => {
          if (json && typeof json === 'object') {
            this.translations[lang as LanguageCode] = json;
            this.version.update((v) => v + 1);
          }
        },
        error: (err) => {
          console.error(`Failed to load assets/i18n/${lang}.json`, err);
        }
      });
    });
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = (localStorage.getItem('astro_mobile_lang') || sessionStorage.getItem('astro_mobile_lang')) as LanguageCode;
      if (savedLang === 'ta' || savedLang === 'en') {
        this.currentLanguageSignal.set(savedLang);
      }
    }
  }

  public setLanguage(lang: LanguageCode): void {
    this.currentLanguageSignal.set(lang);
    this.version.update((v) => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astro_mobile_lang', lang);
      sessionStorage.setItem('astro_mobile_lang', lang);
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguageSignal() === 'ta' ? 'en' : 'ta';
    this.setLanguage(next);
  }

  public translate(key: string, fallback?: string): string {
    this.version();
    const lang = this.currentLanguageSignal();
    const data = this.translations[lang] || {};

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

    // Fallback to English if key missing in current language
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
