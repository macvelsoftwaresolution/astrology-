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

  rules: Rule[] = [];

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
