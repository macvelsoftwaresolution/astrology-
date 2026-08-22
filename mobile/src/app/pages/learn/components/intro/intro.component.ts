import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Topic {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-learn-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  standalone: false
})
export class LearnIntroComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() login = new EventEmitter<void>();

  vilakauraiText: string = 'இந்தப் பாடநெறி பழமையான வேத ஜோதிடத்தின் ரகசியங்களை நவீன முறைப்படி கற்றுக்கொள்ள வடிவமமைக்கப்பட்டுள்ளது. கிரகங்களின் இயக்கங்கள் நமது வாழ்வை எவ்வாறு பாதிக்கின்றன என்பதை ஆழமாகப் புரிந்துகொள்ளும் இது ஒரு தெய்வீகத் தொடக்கம்.';
  
  topics: Topic[] = [
    { title: 'ராசி மண்டலம்', desc: '12 ராசிகள் மற்றும் அவற்றின் குணாதிசயங்கள் பற்றிய தெளிவான புரிதல்.' },
    { title: 'நவக்கிரகங்கள்', desc: '9 கிரகங்களின் தன்மைகள் மற்றும் அவை ஏற்படுத்தும் தாக்கங்கள்.' },
    { title: 'ஜாதக கணிப்பு', desc: 'அடிப்படை ஜாதக கட்டங்களை அமைக்கும் முறை மற்றும் வாசிக்கும் திறன்.' },
    { title: 'பரிகாரங்கள்', desc: 'கிரக தோஷங்களுக்கான எளிய மற்றும் நடைமுறை தீர்வுகள்.' }
  ];

  icons = ['bi-stars', 'bi-sun-fill', 'bi-journal-bookmark-fill', 'bi-shield-fill-check', 'bi-flower1', 'bi-moon-stars-fill'];
  colors = ['box-gold', 'box-peach', 'box-ivory', 'box-red', 'box-muted', 'box-peach'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/settings/lms_vilakaurai`).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.vilakauraiText = res.value;
          this.cdr.detectChanges();
        }
      }
    });

    this.http.get<any>(`${environment.apiUrl}/settings/lms_topics`).subscribe({
      next: (res) => {
        if (res && res.value) {
          try {
            const parsed = JSON.parse(res.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.topics = parsed;
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
