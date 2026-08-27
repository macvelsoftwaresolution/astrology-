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

  vilakauraiText: string = '';
  
  topics: Topic[] = [];

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
