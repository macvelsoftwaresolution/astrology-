import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-rasi-palan',
  templateUrl: './rasi-palan.html',
  styleUrls: ['./rasi-palan.scss'],
  standalone: false
})
export class RasiPalanComponent implements OnDestroy {
  @Input() rasis: any[] = [];
  @Input() showGridOnly: boolean = false;
  @Output() closeFlow = new EventEmitter<void>();

  selectedRasi: any = null;
  selectedRasiTab: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';

  // Audio player simulation state
  audioPlaying: boolean = false;
  audioProgress: number = 0;
  audioDuration: string = '04:20';
  audioCurrentTime: string = '00:00';
  audioInterval: any;

  predictionData: any = null;
  isLoading: boolean = false;

  constructor(
    private navCtrl: NavController, 
    private http: HttpClient,
    public translationService: TranslationService
  ) {}

  get currentLang() {
    return this.translationService.currentLanguage();
  }

  openNotifications() {
    this.navCtrl.navigateForward('/notifications');
  }

  setTab(tab: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    this.selectedRasiTab = tab;
    if (this.selectedRasi) {
      this.fetchPrediction(this.selectedRasi.name);
    }
  }

  selectRasi(rasi: any) {
    this.selectedRasi = rasi;
    this.predictionData = null;
    this.isLoading = true;
    this.stopAudio();
    this.fetchPrediction(rasi.name);
  }

  private defaultPredictions: { [key: string]: string } = {
    'மேஷம்': 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.',
    'ரிஷபம்': 'நினைத்த காரியங்கள் தடையின்றி முடியும். குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
    'மிதுனம்': 'தொழில் மற்றும் வியாபாரத்தில் நல்ல முன்னேற்றம் ஏற்படும். புதிய வாய்ப்புகள் தேடி வரும்.',
    'கடகம்': 'பணப்புழக்கம் அதிகரிக்கும். புதிய முயற்சிகளுக்கு உறவினர்களின் ஆதரவு கிடைக்கும்.',
    'சிம்மம்': 'உத்தியோகத்தில் மேலதிகாரிகளின் பாராட்டு கிடைக்கும். மனதில் தெளிவும் தன்னம்பிக்கையும் கூடும்.',
    'கன்னி': 'திட்டமிட்ட காரியங்கள் சுமுகமாக முடியும். சுபச் செய்திகள் வந்து சேரும்.',
    'துலாம்': 'எடுத்த காரியங்களில் வெற்றி கிடைக்கும். நண்பர்கள் மற்றும் குடும்பத்தினரின் ஒத்துழைப்பு உண்டு.',
    'விருச்சிகம்': 'வியாபாரத்தில் லாபம் அதிகரிக்கும். பழைய கடன்கள் அடைபடும் வாய்ப்பு உண்டு.',
    'தனுசு': 'பயணங்களால் நன்மைகள் கூடும். ஆரோக்கியத்தில் முன்னேற்றம் காணப்படும்.',
    'மகரம்': 'கடைப்பிடித்த உழைப்பிற்கு ஏற்ற பலன் கிடைக்கும். எதிர்பாராத பணவரவு உண்டு.',
    'கும்பம்': 'குடும்பத்தில் சுப நிகழ்ச்சிகள் திட்டமிடப்படும். மனநிறைவும் சந்தோஷமும் அதிகரிக்கும்.',
    'மீனம்': 'சுப காரியங்கள் கைகூடும். புதிய முதலீடுகள் மற்றும் திட்டங்களுக்கு நல்ல நாள்.'
  };

  fetchPrediction(rasiName: string) {
    const today = new Date().toISOString().split('T')[0];
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/rasi-palan?date=${today}&type=${this.selectedRasiTab}`).subscribe({
      next: (res) => {
        const list = res?.predictions || res?.palans || (Array.isArray(res) ? res : []);
        const found = list.find((r: any) => r.rasi_name === rasiName || r.rasi === rasiName);
        
        const rawText = (found && found.prediction_text) ? found.prediction_text.trim() : '';
        const finalText = rawText.length > 0 ? rawText : (this.defaultPredictions[rasiName] || 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.');

        this.predictionData = {
          rasi_name: rasiName,
          prediction_date: (found && found.prediction_date) ? found.prediction_date : today,
          prediction_text: finalText,
          audio_url: found?.audio_url || null,
          video_url: found?.video_url || null
        };
        this.isLoading = false;
      },
      error: () => {
        this.predictionData = {
          rasi_name: rasiName,
          prediction_date: today,
          prediction_text: this.defaultPredictions[rasiName] || 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.',
          audio_url: null,
          video_url: null
        };
        this.isLoading = false;
      }
    });
  }

  closeDetail() {
    this.selectedRasi = null;
    this.predictionData = null;
    this.stopAudio();
  }

  handleBack(): boolean {
    if (this.selectedRasi) {
      this.closeDetail();
      return true;
    }
    return false;
  }

  toggleAudio() {
    if (this.audioPlaying) {
      this.stopAudio();
    } else {
      this.audioPlaying = true;
      this.audioInterval = setInterval(() => {
        if (this.audioProgress < 100) {
          this.audioProgress += 2;
          const currentSeconds = Math.floor((this.audioProgress / 100) * 260);
          const minutes = Math.floor(currentSeconds / 60);
          const seconds = currentSeconds % 60;
          this.audioCurrentTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          this.stopAudio();
        }
      }, 500);
    }
  }

  stopAudio() {
    this.audioPlaying = false;
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
    }
  }

  ngOnDestroy() {
    this.stopAudio();
  }
}
