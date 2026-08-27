import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-matches-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './matches-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './matches-tab.component.css']
})
export class MatchesTabComponent implements OnInit {
  marriageMatches: any[] = [];
  isLoading = false;
  selectedMatch: any = null;
  editingMatch: any = null;
  matchStatusForm: any = { admin_status: 'Pending', consultation_status: 'Pending', admin_notes: '' };

  // Main Layout View Switcher: 'list' | 'report-form'
  activeView: 'list' | 'report-form' = 'list';
  reportingMatch: any = null;
  isSavingReport = false;
  reportForm: any = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadMatches();
    }
  }

  loadMatches(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/marriage-matches`, headers).subscribe({
      next: (res) => {
        const matchesData = (res.matches || []).map((m: any) => ({
          ...m,
          match_details: typeof m.match_details === 'string' ? JSON.parse(m.match_details) : (m.match_details || []),
          report_data: typeof m.report_data === 'string' ? JSON.parse(m.report_data) : (m.report_data || null)
        }));
        setTimeout(() => {
          this.marriageMatches = matchesData;
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  openReportForm(match: any): void {
    this.reportingMatch = match;
    const existing = match.report_data || {};
    const formData = {
      astrologer_title: existing.astrologer_title || 'ஓம் பிரகாஷ்பதி ஜோதிடாலயம்',
      astrologer_name: existing.astrologer_name || 'ஜோதிட பேராசிரியர் "ஜோதிடரத்னா" "ஜோதிட கலாநிதி" கரு.மதிவதனன் (B.A.Dip.Astro)',
      astrologer_phone: existing.astrologer_phone || 'Cell: 9566166963, 9442257639',
      astrologer_address: existing.astrologer_address || 'G.H. ரோடு, வள்ளுவர் சிலை அருகில், தென்காசி',
      
      // Basic Couple Info
      girl_name: existing.girl_name || match.girl_name || '',
      boy_name: existing.boy_name || match.boy_name || '',
      girl_star: existing.girl_star || match.girl_nakshatra || '',
      boy_star: existing.boy_star || match.boy_nakshatra || '',
      girl_rasi: existing.girl_rasi || match.girl_rasi || '',
      boy_rasi: existing.boy_rasi || match.boy_rasi || '',
      girl_age: existing.girl_age || '',
      boy_age: existing.boy_age || '',
      
      // Characteristics
      girl_mirugam: existing.girl_mirugam || '',
      boy_mirugam: existing.boy_mirugam || '',
      girl_patshi: existing.girl_patshi || '',
      boy_patshi: existing.boy_patshi || '',
      girl_maram: existing.girl_maram || '',
      boy_maram: existing.boy_maram || '',
      girl_ganam: existing.girl_ganam || '',
      boy_ganam: existing.boy_ganam || '',
      girl_nadi: existing.girl_nadi || '',
      boy_nadi: existing.boy_nadi || '',

      // 11 Poruthangal Status (Clean & Blank by default)
      poruthangal: existing.poruthangal && existing.poruthangal.length > 0 ? existing.poruthangal : [
        { name: '1. தினம் பொருத்தம்', status: '' },
        { name: '2. கணம் பொருத்தம்', status: '' },
        { name: '3. மகேந்திரப் பொருத்தம்', status: '' },
        { name: '4. ஸ்திரீ தீர்க்கம்', status: '' },
        { name: '5. யோனி பொருத்தம்', status: '' },
        { name: '6. ராசி பொருத்தம்', status: '' },
        { name: '7. ராசி அதிபதி பொருத்தம்', status: '' },
        { name: '8. வசியம் பொருத்தம்', status: '' },
        { name: '9. ரஜ்ஜு பொருத்தம்', status: '' },
        { name: '10. வேதை பொருத்தம்', status: '' },
        { name: '11. நாடி பொருத்தம்', status: '' }
      ],

      // House & Planet Checks (Girl & Boy)
      girl_house_2: existing.girl_house_2 || '',
      boy_house_2: existing.boy_house_2 || '',
      girl_house_5: existing.girl_house_5 || '',
      boy_house_5: existing.boy_house_5 || '',
      girl_house_7: existing.girl_house_7 || '',
      boy_house_7: existing.boy_house_7 || '',
      girl_guru_balam: existing.girl_guru_balam || '',
      boy_guru_balam: existing.boy_guru_balam || '',
      girl_dosham: existing.girl_dosham || '',
      boy_dosham: existing.boy_dosham || '',
      girl_dhasa_sandhi: existing.girl_dhasa_sandhi || '',
      boy_dhasa_sandhi: existing.boy_dhasa_sandhi || '',
      girl_analysis: existing.girl_analysis || '',
      boy_analysis: existing.boy_analysis || '',

      // Summary (Clean & Blank by default)
      total_porutham: existing.total_porutham || '',
      important_porutham: existing.important_porutham || '',
      astrologer_opinion: existing.astrologer_opinion || ''
    };

    setTimeout(() => {
      this.reportForm = formData;
      this.activeView = 'report-form';
      this.cdr.markForCheck();
    }, 0);
  }

  saveReportForm(): void {
    if (!this.reportingMatch) return;
    this.isSavingReport = true;

    const headers = this.authService.getAuthHeaders();
    const payload = {
      admin_status: 'Completed',
      admin_notes: this.reportForm.astrologer_opinion || 'திருமணப் பொருத்த அறிக்கை தயார் செய்யப்பட்டது.',
      report_data: this.reportForm
    };

    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${this.reportingMatch.id}`, payload, headers).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isSavingReport = false;
          alert('திருமணப் பொருத்த அறிக்கை வெற்றிகரமாக சேமிக்கப்பட்டு பயனருக்கு அனுப்பப்பட்டது!');
          this.activeView = 'list';
          this.reportingMatch = null;
          this.loadMatches();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.isSavingReport = false;
          alert('அறிக்கையைச் சேமிப்பதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
        }, 0);
      }
    });
  }

  closeReportForm(): void {
    setTimeout(() => {
      this.activeView = 'list';
      this.reportingMatch = null;
      this.cdr.markForCheck();
    }, 0);
  }

  openEditMatchStatus(match: any): void {
    this.editingMatch = match;
    const status = match.admin_status || match.consultation_status || 'Pending';
    this.matchStatusForm = {
      admin_status: status,
      consultation_status: status,
      admin_notes: match.admin_notes || ''
    };
  }

  saveMatchStatus(): void {
    if (!this.editingMatch) return;
    const headers = this.authService.getAuthHeaders();
    const payload = this.matchStatusForm;
    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${this.editingMatch.id}`, payload, headers).subscribe({
      next: (res) => {
        if (res.success) {
          this.editingMatch.admin_status = payload.admin_status;
          this.editingMatch.admin_notes = payload.admin_notes;
          this.editingMatch = null;
        }
      },
      error: () => alert('Failed to update status')
    });
  }

  deleteMatch(id: number): void {
    if (!confirm('இந்த கோரிக்கையை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Are you sure you want to delete this?)')) return;
    
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/marriage-matches/${id}`, headers).subscribe({
      next: (res) => {
        if (res.success) {
          this.marriageMatches = this.marriageMatches.filter(m => m.id !== id);
          if (this.selectedMatch && this.selectedMatch.id === id) {
            this.selectedMatch = null;
          }
        }
      },
      error: () => alert('Failed to delete match')
    });
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadingMatchId: number | null = null;

  triggerUpload(matchId: number): void {
    this.uploadingMatchId = matchId;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.uploadingMatchId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'marriage_documents');

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.url) {
          this.saveResultDocument(this.uploadingMatchId!, res.url);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        alert('File upload failed.');
      }
    });
  }

  saveResultDocument(matchId: number, url: string): void {
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${matchId}`, { result_document: url }, headers).subscribe({
      next: () => {
        alert('Result document uploaded successfully!');
        this.uploadingMatchId = null;
        this.loadMatches();
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to save result document.');
      }
    });
  }
}
