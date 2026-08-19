import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-rasi-editor-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './rasi-editor-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './rasi-editor-tab.component.css']
})
export class RasiEditorTabComponent implements OnInit {
  rasiEditorType = 'daily';
  selectedRasiDate = new Date().toISOString().split('T')[0];
  rasiPredictionsLoading = false;
  rasiPublishing = false;
  rasiSaveSuccessMsg = '';
  selectedRasiIndex: number | null = null;

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
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20' }
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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadRasiPredictions();
      this.loadPanchangam();
    }
  }

  loadRasiPredictions(): void {
    this.rasiPredictionsLoading = true;
    this.http.get<any>(`http://127.0.0.1:8000/api/rasi-palan?type=${this.rasiEditorType}&date=${this.selectedRasiDate}`).subscribe({
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
        } else {
          this.rasiPredictions = this.rasiEditorList.map(r => ({
            rasi_name: r.name,
            prediction_text: '',
            audio_url: '',
            video_url: ''
          }));
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
    this.http.get<any>('http://127.0.0.1:8000/api/panchangam/today').subscribe({
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

    this.http.put<any>('http://127.0.0.1:8000/api/admin/rasi-palan', payload, headers).subscribe({
      next: () => {
        this.rasiSaveSuccessMsg = `✅ ${item.rasi_name} ராசிக்கான ${this.rasiEditorType} பலன் சேமிக்கப்பட்டது!`;
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 3500);
      },
      error: () => alert(`Failed to save ${item.rasi_name} prediction.`)
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

    this.http.put<any>('http://127.0.0.1:8000/api/admin/rasi-palan', payload, headers).subscribe({
      next: (res) => {
        this.rasiPublishing = false;
        this.rasiSaveSuccessMsg = res.message || `✅ அனைத்து 12 ராசிகளின் ${this.rasiEditorType} பலன்களும் வெளியிடப்பட்டது!`;
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 4000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.rasiPublishing = false;
        alert('Failed to publish all Rasi Palan predictions.');
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

    this.http.put<any>('http://127.0.0.1:8000/api/admin/panchangam', payload, headers).subscribe({
      next: (res) => alert(res.message || 'Panchangam updated successfully!'),
      error: () => alert('Failed to update Panchangam.')
    });
  }

  isUploadingRasiAudio = false;
  isUploadingRasiVideo = false;

  uploadRasiAudio(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || index === null || !this.rasiPredictions[index]) return;

    this.isUploadingRasiAudio = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'audio');

    this.http.post<any>('http://127.0.0.1:8000/api/upload', formData).subscribe({
      next: (res) => {
        if (res && res.url && this.rasiPredictions[index]) {
          this.rasiPredictions[index].audio_url = res.url;
        }
        this.isUploadingRasiAudio = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Audio upload failed.');
        this.isUploadingRasiAudio = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadRasiVideo(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || index === null || !this.rasiPredictions[index]) return;

    this.isUploadingRasiVideo = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'videos');

    this.http.post<any>('http://127.0.0.1:8000/api/upload', formData).subscribe({
      next: (res) => {
        if (res && res.url && this.rasiPredictions[index]) {
          this.rasiPredictions[index].video_url = res.url;
        }
        this.isUploadingRasiVideo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Video upload failed.');
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
    audio.play().catch(() => alert('Could not play audio from: ' + url));
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
