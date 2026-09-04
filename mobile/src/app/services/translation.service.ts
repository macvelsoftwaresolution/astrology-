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
      return this.cleanText(result, lang);
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
        return this.cleanText(enResult, lang);
      }
    }

    // Fallback to Tamil if key missing in English
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
        return this.cleanText(taResult, lang);
      }
    }

    const raw = fallback !== undefined ? fallback : key;
    return this.cleanText(raw, lang);
  }

  public cleanText(text: string, lang: LanguageCode): string {
    if (!text || typeof text !== 'string') return '';
    if (lang === 'ta') {
      // PURE TAMIL: strip any English inside brackets
      return text.replace(/\s*\([A-Za-z\s0-9#\-_:.\/\\+*&]+\)/g, '').trim();
    } else {
      // PURE ENGLISH: if Tamil prefix with English brackets like "ரத்து (Cancel)" or "சேமி (Save)"
      const match = text.match(/[\u0B80-\u0BFF]+[^(]*\(([^)]+)\)/);
      if (match && match[1] && /[A-Za-z]/.test(match[1])) {
        return match[1].trim();
      }
      return text;
    }
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}
