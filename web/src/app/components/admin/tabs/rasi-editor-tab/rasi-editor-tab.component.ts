import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-rasi-editor-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rasi-editor-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './rasi-editor-tab.component.css']
})
export class RasiEditorTabComponent implements OnInit {
  rasiEditorType = 'daily';
  selectedRasiDate = new Date().toISOString().split('T')[0];
  rasiPredictionsLoading = false;
  rasiPublishing = false;
  rasiSaveSuccessMsg = '';

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

  defaultRasiPredictions: Record<string, string> = {
    'மேஷம்': 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.',
    'ரிஷபம்': 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
    'மிதுனம்': 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
    'கடகம்': 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.',
    'சிம்மம்': 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.',
    'கன்னி': 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.',
    'துலாம்': 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.',
    'விருச்சிகம்': 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.',
    'தனுசு': 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.',
    'மகரம்': 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.',
    'கும்பம்': 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.',
    'மீனம்': 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.'
  };

  rasiPredictions: { rasi_name: string; prediction_text: string; audio_url: string; video_url: string }[] = this.rasiEditorList.map(r => ({
    rasi_name: r.name,
    prediction_text: this.defaultRasiPredictions[r.name] || '',
    audio_url: '',
    video_url: ''
  }));

  panchangamForm = {
    thithi: 'சுக்ல பக்ஷ துவாதசி (Shukla Paksha Dvadasi)',
    star: 'திருவோணம் (Thiruvonam)',
    rahukalam: '07:30 AM - 09:00 AM',
    yamagandam: '01:30 PM - 03:00 PM',
    nalla_neram: '09:15 AM - 10:15 AM & 04:45 PM - 05:45 PM'
  };

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
    this.loadRasiPredictions();
    this.loadPanchangam();
  }

  loadRasiPredictions(): void {
    this.rasiPredictionsLoading = true;
    this.http.get<any>(`http://127.0.0.1:8000/api/rasi-palan?type=${this.rasiEditorType}&date=${this.selectedRasiDate}`).subscribe({
      next: (res) => {
        if (res && res.palans && Array.isArray(res.palans) && res.palans.length > 0) {
          this.rasiPredictions = this.rasiEditorList.map(r => {
            const found = res.palans.find((p: any) => p.rasi_name === r.name);
            return {
              rasi_name: r.name,
              prediction_text: found?.prediction_text || this.defaultRasiPredictions[r.name] || '',
              audio_url: found?.audio_url || '',
              video_url: found?.video_url || ''
            };
          });
        } else {
          this.rasiPredictions = this.rasiEditorList.map(r => ({
            rasi_name: r.name,
            prediction_text: this.defaultRasiPredictions[r.name] || '',
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
      prediction_date: this.selectedRasiDate
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
      prediction_date: this.selectedRasiDate
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
    const rasiName = this.rasiEditorList[index]?.name;
    if (rasiName && this.defaultRasiPredictions[rasiName]) {
      this.rasiPredictions[index].prediction_text = this.defaultRasiPredictions[rasiName];
    }
  }

  resetAllToDefaults(): void {
    if (!confirm('Are you sure you want to reset all 12 Rasi predictions to default template text?')) return;
    this.rasiPredictions = this.rasiEditorList.map(r => ({
      rasi_name: r.name,
      prediction_text: this.defaultRasiPredictions[r.name] || '',
      audio_url: '',
      video_url: ''
    }));
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
