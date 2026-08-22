import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Rule {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-learn-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  standalone: false
})
export class LearnRulesComponent implements OnInit {
  @Output() next = new EventEmitter<void>();

  rules: Rule[] = [
    { title: 'காலம் தவறாமை', desc: 'அனைத்து வகுப்புகளுக்கும் குறிப்பிட்ட நேரத்தில் ஆஜராக வேண்டும். காலதாமதம் தவிர்க்கப்பட வேண்டும்.' },
    { title: 'வீட்டுப்பாடம்', desc: 'வழங்கப்படும் அனைத்து பயிற்சிகளையும், வீட்டுப்பாடங்களையும் குறித்த நேரத்திற்குள் சமர்ப்பிக்க வேண்டும்.' },
    { title: 'பதிவு செய்ய தடை', desc: 'வகுப்புகளை எவ்விதத்திலும் பதிவு செய்யவோ (Audio/Video), பிறருடன் பகிரவோ அனுமதி இல்லை.' },
    { title: 'மரியாதை மற்றும் ஒழுக்கம்', desc: 'ஆசிரியர்கள் மற்றும் சக மாணவர்களிடம் உரிய மரியாதையுடனும், கண்ணியத்துடனும் நடந்து கொள்ள வேண்டும்.' },
    { title: 'கற்றலில் அர்ப்பணிப்பு', desc: 'கற்பிக்கப்படும் புனிதமான சாஸ்திரங்களை முழு ஈடுபாட்டுடனும், பக்தியுடனும் கற்க வேண்டும்.' }
  ];

  icons = ['bi-clock-history', 'bi-journal-bookmark-fill', 'bi-slash-circle-fill', 'bi-people-fill', 'bi-heart-pulse-fill'];
  colors = ['box-gold', 'box-peach', 'box-red', 'box-ivory', 'box-muted'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/settings/lms_rules_list`).subscribe({
      next: (res) => {
        if (res && res.value) {
          try {
            const parsed = JSON.parse(res.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.rules = parsed;
              this.cdr.detectChanges();
            }
          } catch(e) {}
        }
      }
    });
  }

  getIcon(index: number): string {
    return this.icons[index % this.icons.length];
  }

  getColorClass(index: number): string {
    return this.colors[index % this.colors.length];
  }
}
