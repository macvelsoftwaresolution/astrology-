import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-rasi-editor-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './rasi-editor-tab.html',
  styleUrls: ['../../admin-dashboard.css', './rasi-editor-tab.css']
})
export class RasiEditorTabComponent implements OnInit {
  rasiEditorType = 'daily';
  selectedRasiDate = new Date().toISOString().split('T')[0];
  rasiPredictionsLoading = false;
  rasiPublishing = false;
  rasiSaveSuccessMsg = '';
  selectedRasiIndex: number | null = null;
  isComingSoon: boolean = false;
  private backupPredictions: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  getRasiDisplayName(r: any): string {
    if (!r) return '';
    if (this.translationService.currentLanguage() === 'en') {
      return r.englishName || r.name;
    }
    return r.name;
  }

  openRasiEditor(index: number): void {
    this.selectedRasiIndex = index;
  }

  closeRasiEditor(): void {
    this.selectedRasiIndex = null;
  }

  nextRasi(): void {
    if (this.selectedRasiIndex !== null) {
      this.selectedRasiIndex = (this.selectedRasiIndex + 1) % this.rasiEditorList.length;
    }
  }

  prevRasi(): void {
    if (this.selectedRasiIndex !== null) {
      this.selectedRasiIndex = (this.selectedRasiIndex - 1 + this.rasiEditorList.length) % this.rasiEditorList.length;
    }
  }

  rasiTypes = [
    { val: 'daily', label: 'Daily', tamilLabel: 'தினசரி' },
    { val: 'weekly', label: 'Weekly', tamilLabel: 'வாராந்திர' },
    { val: 'monthly', label: 'Monthly', tamilLabel: 'மாதாந்திர' },
    { val: 'yearly', label: 'Yearly', tamilLabel: 'வருடாந்திர' }
  ];

  rasiEditorList = [
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19', customIcon: '' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20', customIcon: '' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20', customIcon: '' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22', customIcon: '' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22', customIcon: '' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22', customIcon: '' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22', customIcon: '' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21', customIcon: '' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21', customIcon: '' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19', customIcon: '' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18', customIcon: '' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20', customIcon: '' }
  ];

  rasiPredictions: { rasi_name: string; prediction_text: string; audio_url: string; video_url: string }[] = this.rasiEditorList.map(r => ({
    rasi_name: r.name,
    prediction_text: '',
    audio_url: '',
    video_url: ''
  }));

  panchangamForm = {
    thithi: '',
    star: '',
    rahukalam: '',
    yamagandam: '',
    nalla_neram: ''
  };

  // Interactive Time Pickers State
  timePickers = {
    rahuFrom: '',
    rahuTo: '',
    yamaFrom: '',
    yamaTo: '',
    nallaMornFrom: '',
    nallaMornTo: '',
    nallaEveFrom: '',
    nallaEveTo: ''
  };

  formatTime12(time24: string): string {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hh = h < 10 ? '0' + h : '' + h;
    return `${hh}:${m} ${ampm}`;
  }

  async toggleComingSoon(): Promise<void> {
    if (this.isComingSoon) {
      const ok = await this.confirmService.confirm({
        title: 'விரைவில் வரும் என குறிக்கவா?',
        message: 'இந்த தேதிக்கான அனைத்து 12 ராசிகளையும் "விரைவில் பதிவேற்றப்படும்" என குறிக்க விரும்புகிறீர்களா?',
        confirmText: 'ஆம், குறிக்க',
        type: 'warning',
        icon: 'bi bi-clock-history'
      });
      if (ok) {
        this.backupPredictions = JSON.parse(JSON.stringify(this.rasiPredictions));
        this.rasiPredictions.forEach(r => {
          r.prediction_text = 'விரைவில் பதிவேற்றப்படும்...';
          r.video_url = '';
          r.audio_url = '';
        });
        this.publishRasiPalan();
      } else {
        setTimeout(() => this.isComingSoon = false, 0);
      }
    } else {
      if (this.backupPredictions.length > 0) {
        this.rasiPredictions = JSON.parse(JSON.stringify(this.backupPredictions));
      } else {
        this.rasiPredictions.forEach(r => {
          if (r.prediction_text === 'விரைவில் பதிவேற்றப்படும்...') {
            r.prediction_text = '';
          }
        });
      }
    }
  }

  updateRahukalamFromPickers(): void {
    if (this.timePickers.rahuFrom && this.timePickers.rahuTo) {
      this.panchangamForm.rahukalam = `${this.formatTime12(this.timePickers.rahuFrom)} - ${this.formatTime12(this.timePickers.rahuTo)}`;
    }
  }

  updateYamagandamFromPickers(): void {
    if (this.timePickers.yamaFrom && this.timePickers.yamaTo) {
      this.panchangamForm.yamagandam = `${this.formatTime12(this.timePickers.yamaFrom)} - ${this.formatTime12(this.timePickers.yamaTo)}`;
    }
  }

  updateNallaNeramFromPickers(): void {
    const parts: string[] = [];
    if (this.timePickers.nallaMornFrom && this.timePickers.nallaMornTo) {
      parts.push(`${this.formatTime12(this.timePickers.nallaMornFrom)} - ${this.formatTime12(this.timePickers.nallaMornTo)} (காலை)`);
    }
    if (this.timePickers.nallaEveFrom && this.timePickers.nallaEveTo) {
      parts.push(`${this.formatTime12(this.timePickers.nallaEveFrom)} - ${this.formatTime12(this.timePickers.nallaEveTo)} (மாலை)`);
    }
    if (parts.length > 0) {
      this.panchangamForm.nalla_neram = parts.join(' / ');
    }
  }

  setPreset(field: 'rahukalam' | 'yamagandam' | 'nalla_neram', val: string): void {
    this.panchangamForm[field] = val;
  }

  // Video Preview Modal
  previewVideoModal = false;
  previewVideoUrl = '';
  previewVideoTitle = '';
  previewVideoSafeUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadRasiIcons();
      this.loadRasiPredictions();
      this.loadPanchangam();
    }
  }

  loadRasiIcons(): void {
    this.http.get<any>(`${environment.apiUrl}/rasi-icons`).subscribe({
      next: (res) => {
        if (res) {
          this.rasiEditorList.forEach(r => {
            if (res[r.name]) {
              r.customIcon = res[r.name];
            }
          });
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  uploadRasiIcon(event: any, rasi: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'rasi_icons');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.url) {
          rasi.customIcon = res.url;
          this.saveAllRasiIcons();
        }
      },
      error: (err) => {
        console.error('Failed to upload rasi icon', err);
        this.toastService.error('Failed to upload icon.');
      }
    });
  }

  saveAllRasiIcons(): void {
    const payload: any = {};
    this.rasiEditorList.forEach(r => {
      if (r.customIcon) {
        payload[r.name] = r.customIcon;
      }
    });
    this.http.post<any>(`${environment.apiUrl}/admin/rasi-icons`, payload, this.authService.getAuthHeaders()).subscribe({
      next: (res) => {
        this.rasiSaveSuccessMsg = 'Rasi icon updated successfully!';
        setTimeout(() => this.rasiSaveSuccessMsg = '', 3000);
      },
      error: () => {}
    });
  }

  loadRasiPredictions(): void {
    this.rasiPredictionsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/rasi-palan?type=${this.rasiEditorType}&date=${this.selectedRasiDate}`).subscribe({
      next: (res) => {
        const list = res?.predictions || res?.palans || [];
        if (Array.isArray(list) && list.length > 0) {
          this.rasiPredictions = this.rasiEditorList.map(r => {
            const found = list.find((p: any) => p.rasi_name === r.name);
            return {
              rasi_name: r.name,
              prediction_text: found?.prediction_text || '',
              audio_url: found?.audio_url || '',
              video_url: found?.video_url || ''
            };
          });
          this.isComingSoon = this.rasiPredictions.length > 0 && this.rasiPredictions.every(r => r.prediction_text === 'விரைவில் பதிவேற்றப்படும்...');
        } else {
          this.rasiPredictions = this.rasiEditorList.map(r => ({
            rasi_name: r.name,
            prediction_text: '',
            audio_url: '',
            video_url: ''
          }));
          this.isComingSoon = false;
        }
        this.rasiPredictionsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rasiPredictionsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPanchangam(): void {
    this.http.get<any>(`${environment.apiUrl}/panchangam/today`).subscribe({
      next: (res) => {
        if (res && res.panchangam) {
          this.panchangamForm = { ...res.panchangam };
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  changeRasiType(type: string): void {
    this.rasiEditorType = type;
    this.loadRasiPredictions();
  }

  saveSingleRasi(index: number): void {
    const item = this.rasiPredictions[index];
    if (!item) return;

    const headers = this.authService.getAuthHeaders();
    const payload = {
      predictions: [item],
      tab_type: this.rasiEditorType,
      type: this.rasiEditorType,
      prediction_date: this.selectedRasiDate,
      date: this.selectedRasiDate
    };

    this.http.put<any>(`${environment.apiUrl}/admin/rasi-palan`, payload, headers).subscribe({
      next: () => {
        this.rasiSaveSuccessMsg = `${item.rasi_name} ராசிக்கான ${this.rasiEditorType} பலன் சேமிக்கப்பட்டது!`;
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 3500);
      },
      error: () => this.toastService.error(`Failed to save ${item.rasi_name} prediction.`)
    });
  }

  publishRasiPalan(): void {
    this.rasiPublishing = true;
    const headers = this.authService.getAuthHeaders();
    const payload = {
      predictions: this.rasiPredictions,
      tab_type: this.rasiEditorType,
      type: this.rasiEditorType,
      prediction_date: this.selectedRasiDate,
      date: this.selectedRasiDate
    };

    this.http.put<any>(`${environment.apiUrl}/admin/rasi-palan`, payload, headers).subscribe({
      next: (res) => {
        this.rasiPublishing = false;
        this.rasiSaveSuccessMsg = res.message || `அனைத்து 12 ராசிகளின் ${this.rasiEditorType} பலன்களும் வெளியிடப்பட்டது!`;
        this.toastService.success(this.rasiSaveSuccessMsg, 'வெற்றிகரமாக வெளியிடப்பட்டது');
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 4000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.rasiPublishing = false;
        this.toastService.error('Failed to publish all Rasi Palan predictions.');
        this.cdr.detectChanges();
      }
    });
  }

  resetRasiToDefault(index: number): void {
    this.loadRasiPredictions();
  }

  resetAllToDefaults(): void {
    this.loadRasiPredictions();
  }

  savePanchangam(): void {
    const headers = this.authService.getAuthHeaders();
    const payload = {
      date: new Date().toISOString().split('T')[0],
      ...this.panchangamForm
    };

    this.http.put<any>(`${environment.apiUrl}/admin/panchangam`, payload, headers).subscribe({
      next: (res) => this.toastService.success(res.message || 'Panchangam updated successfully!'),
      error: () => this.toastService.error('Failed to update Panchangam.')
    });
  }

  isUploadingRasiAudio = false;
  isUploadingRasiVideo = false;

  uploadRasiAudio(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || index === null || !this.rasiPredictions[index]) return;

    // Client-side file size check (Max 10 MB)
    const maxAudioSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxAudioSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.toastService.warning(`தேர்ந்தெடுக்கப்பட்ட ஆடியோ கோப்பு ${sizeMb} MB உள்ளது! 10 MB-க்குள் இருக்கும் ஆடியோ கோப்பைத் தேர்ந்தெடுக்கவும். (Audio file exceeds 10 MB limit)`, 'கோப்பு அளவு அதிகம்');
      return;
    }

    this.isUploadingRasiAudio = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'audio');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.rasiPredictions[index]) {
          this.rasiPredictions[index].audio_url = res.url;
          this.toastService.success('ஆடியோ கோப்பு பதிவேற்றப்பட்டது!', 'வெற்றி');
        }
        this.isUploadingRasiAudio = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 413) {
          this.toastService.error('413 Request Entity Too Large: ஆடியோ கோப்பின் அளவு சேவையக எல்லைக்கு (10 MB) அதிகமாக உள்ளது!', 'பதிவேற்றப் பிழை');
        } else {
          this.toastService.error('Audio upload failed.', 'பதிவேற்றப் பிழை');
        }
        this.isUploadingRasiAudio = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadRasiVideo(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || index === null || !this.rasiPredictions[index]) return;

    // Client-side file size check (Max 25 MB)
    const maxVideoSize = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxVideoSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.toastService.warning(`தேர்ந்தெடுக்கப்பட்ட வீடியோ கோப்பு ${sizeMb} MB உள்ளது! 25 MB-க்குள் இருக்கும் வீடியோ கோப்பைத் தேர்ந்தெடுக்கவும். (Video file exceeds 25 MB limit)`, 'கோப்பு அளவு அதிகம்');
      return;
    }

    this.isUploadingRasiVideo = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'videos');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.rasiPredictions[index]) {
          this.rasiPredictions[index].video_url = res.url;
          this.toastService.success('வீடியோ பதிவேற்றப்பட்டது!', 'வெற்றி');
        }
        this.isUploadingRasiVideo = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 413) {
          this.toastService.error('413 Request Entity Too Large: வீடியோ கோப்பின் அளவு சேவையக எல்லைக்கு அதிகமாக உள்ளது! சிறிய வீடியோவை முயற்சி செய்யவும்.', 'பதிவேற்றப் பிழை');
        } else {
          this.toastService.error('Video upload failed.', 'பதிவேற்றப் பிழை');
        }
        this.isUploadingRasiVideo = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeRasiAudio(index: number): void {
    if (index !== null && this.rasiPredictions[index]) {
      this.rasiPredictions[index].audio_url = '';
      this.cdr.detectChanges();
    }
  }

  removeRasiVideo(index: number): void {
    if (index !== null && this.rasiPredictions[index]) {
      this.rasiPredictions[index].video_url = '';
      this.cdr.detectChanges();
    }
  }

  testAudio(url: string): void {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(() => this.toastService.warning('Could not play audio from: ' + url, 'ஆடியோ இயக்க முடியவில்லை'));
  }

  openVideoPreview(url: string, title: string): void {
    if (!url) return;
    this.previewVideoTitle = title;
    this.previewVideoUrl = url;

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      const embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
      this.previewVideoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.previewVideoSafeUrl = null;
    }

    this.previewVideoModal = true;
  }

  closeVideoPreview(): void {
    this.previewVideoModal = false;
    this.previewVideoSafeUrl = null;
    this.previewVideoUrl = '';
    this.previewVideoTitle = '';
  }
}
