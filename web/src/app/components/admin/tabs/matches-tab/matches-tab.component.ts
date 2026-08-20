import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
        this.marriageMatches = (res.matches || []).map((m: any) => ({
          ...m,
          match_details: typeof m.match_details === 'string' ? JSON.parse(m.match_details) : (m.match_details || [])
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  poruthamTamilMap: { [key: string]: { tamil: string; desc: string } } = {
    'Dinam': { tamil: 'தினப் பொருத்தம்', desc: 'ஆயுள், உடல் ஆரோக்கியம்' },
    'Ganam': { tamil: 'கணப் பொருத்தம்', desc: 'குண ஒற்றுமை, சுபாவம்' },
    'Mahendram': { tamil: 'மகேந்திரப் பொருத்தம்', desc: 'புத்திர பாக்கியம், வம்ச விருத்தி' },
    'Stree Deergham': { tamil: 'ஸ்திரீ தீர்க்கம்', desc: 'சகல ஐஸ்வர்யம், லட்சுமி கடாட்சம்' },
    'Yoni': { tamil: 'யோனிப் பொருத்தம்', desc: 'தாம்பத்ய சுகம், மன ஈர்ப்பு' },
    'Rasi': { tamil: 'இராசிப் பொருத்தம்', desc: 'குடும்ப ஒற்றுமை, சுப விருத்தி' },
    'Rasi Adhipathi': { tamil: 'இராசி அதிபதி பொருத்தம்', desc: 'கிரக நட்பு, சமாதானம்' },
    'Vasiyam': { tamil: 'வசியப் பொருத்தம்', desc: 'அன்யோன்யம், ஈர்ப்பு' },
    'Rajju': { tamil: 'ரஜ்ஜுப் பொருத்தம்', desc: 'மாங்கல்ய பலம் (அதி முக்கியம்)' },
    'Vedhai': { tamil: 'வேதைப் பொருத்தம்', desc: 'துன்பமின்மை, பகையற்ற நிலை' },
    'Nadi': { tamil: 'நாடிப் பொருத்தம்', desc: 'மரபணு சுப நிலை, ஆரோக்கியம்' }
  };

  getMatchDetailsArray(details: any): any[] {
    let list: any[] = [];
    if (Array.isArray(details)) {
      list = details;
    } else if (typeof details === 'object' && details !== null) {
      list = Object.keys(details).map(k => ({ name: k, ...details[k] }));
    }

    return list.map(item => {
      const isMatched = item.match === true || item.score === 1 || item.result === 'Match' || item.result === 'Matched' || item.points === 1;
      const engName = item.name || item.title || 'Porutham';
      const meta = this.poruthamTamilMap[engName];
      const tamilName = item.tamil_name || (meta ? meta.tamil : engName);
      const desc = item.desc || (meta ? meta.desc : '');
      return {
        ...item,
        name: engName,
        tamil_name: tamilName,
        desc: desc,
        match: isMatched
      };
    });
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
    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${this.editingMatch.id}`, this.matchStatusForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Match consultation status updated successfully!');
        this.editingMatch = null;
        this.loadMatches();
      },
      error: () => alert('Failed to update match status.')
    });
  }
}
