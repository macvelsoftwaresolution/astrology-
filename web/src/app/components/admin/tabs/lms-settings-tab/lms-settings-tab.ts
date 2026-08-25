import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

interface ListItem {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-lms-settings-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './lms-settings-tab.html',
  styleUrls: ['../../admin-dashboard.component.css', './lms-settings-tab.css']
})
export class LmsSettingsTabComponent implements OnInit {
  ilanilaiFee: number = 2500;
  mudhunilaiFee: number = 3500;
  vilakaurai: string = '';
  
  topics: ListItem[] = [];
  rules: ListItem[] = [];

  isSaving: boolean = false;
  saveMsg: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    const headers = this.authService.getAuthHeaders();
    
    // Load Fees
    this.http.get<any>(`${environment.apiUrl}/settings/lms_ilanilai_fee`, headers).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.ilanilaiFee = Number(res.value) || 2500;
        }
        this.cdr.detectChanges();
      }
    });

    this.http.get<any>(`${environment.apiUrl}/settings/lms_mudhunilai_fee`, headers).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.mudhunilaiFee = Number(res.value) || 3500;
        }
        this.cdr.detectChanges();
      }
    });

    // Load Vilakaurai
    this.http.get<any>(`${environment.apiUrl}/settings/lms_vilakaurai`, headers).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.vilakaurai = res.value;
        }
        this.cdr.detectChanges();
      }
    });

    // Load Topics
    this.http.get<any>(`${environment.apiUrl}/settings/lms_topics`, headers).subscribe({
      next: (res) => {
        if (res && res.value) {
          try {
            this.topics = JSON.parse(res.value);
          } catch(e) {}
        }
        this.cdr.detectChanges();
      }
    });

    // Load Rules
    this.http.get<any>(`${environment.apiUrl}/settings/lms_rules_list`, headers).subscribe({
      next: (res) => {
        if (res && res.value) {
          try {
            this.rules = JSON.parse(res.value);
          } catch(e) {}
        }
        this.cdr.detectChanges();
      }
    });
  }

  addTopic() {
    this.topics.push({ title: '', desc: '' });
  }

  removeTopic(index: number) {
    this.topics.splice(index, 1);
  }

  addRule() {
    this.rules.push({ title: '', desc: '' });
  }

  removeRule(index: number) {
    this.rules.splice(index, 1);
  }

  saveSettings(): void {
    this.isSaving = true;
    const headers = this.authService.getAuthHeaders();

    const pFee1 = this.http.post<any>(`${environment.apiUrl}/settings/lms_ilanilai_fee`, { value: String(this.ilanilaiFee || 2500) }, headers).toPromise();
    const pFee2 = this.http.post<any>(`${environment.apiUrl}/settings/lms_mudhunilai_fee`, { value: String(this.mudhunilaiFee || 3500) }, headers).toPromise();
    const p1 = this.http.post<any>(`${environment.apiUrl}/settings/lms_vilakaurai`, { value: this.vilakaurai }, headers).toPromise();
    const p2 = this.http.post<any>(`${environment.apiUrl}/settings/lms_topics`, { value: JSON.stringify(this.topics) }, headers).toPromise();
    const p3 = this.http.post<any>(`${environment.apiUrl}/settings/lms_rules_list`, { value: JSON.stringify(this.rules) }, headers).toPromise();

    Promise.all([pFee1, pFee2, p1, p2, p3]).then(() => {
      this.isSaving = false;
      this.saveMsg = 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன! (Settings saved successfully)';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.saveMsg = '';
        this.cdr.detectChanges();
      }, 3000);
    }).catch(() => {
      this.isSaving = false;
      alert('Failed to save settings.');
      this.cdr.detectChanges();
    });
  }
}
