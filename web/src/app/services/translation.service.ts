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

    return fallback !== undefined ? fallback : key;
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
