import { Component, Input } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-panchangam-widget',
  templateUrl: './panchangam-widget.html',
  styleUrls: ['./panchangam-widget.scss'],
  standalone: false
})
export class PanchangamWidgetComponent {
  @Input() panchangam: any = {
    thithi: '',
    star: '',
    rahukalam: '',
    yamagandam: '',
    nalla_neram: ''
  };

  constructor(public translationService: TranslationService) {}

  get currentLang() {
    return this.translationService.currentLanguage();
  }

  getMorningNallaNeram(): string {
    const raw = this.panchangam?.nalla_neram || '';
    if (!raw) return '';
    const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*\((?:காலை|Morning)\)/i);
    if (match) return match[1].trim();
    const parts = raw.split('/');
    if (parts[0] && parts.length > 1) return parts[0].replace(/\s*\([^)]*\)/, '').trim();
    return '';
  }

  getEveningNallaNeram(): string {
    const raw = this.panchangam?.nalla_neram || '';
    if (!raw) return '';
    const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*\((?:மாலை|Evening)\)/i);
    if (match) return match[1].trim();
    const parts = raw.split('/');
    if (parts[1]) return parts[1].replace(/\s*\([^)]*\)/, '').trim();
    return '';
  }

  getFormattedNallaNeram(): string {
    const raw = this.panchangam?.nalla_neram || '';
    if (!raw) return '-';
    const isEn = this.currentLang === 'en';
    if (isEn) {
      return raw.replace(/காலை/g, 'Morning').replace(/மாலை/g, 'Evening');
    } else {
      return raw.replace(/Morning/g, 'காலை').replace(/Evening/g, 'மாலை');
    }
  }
}
