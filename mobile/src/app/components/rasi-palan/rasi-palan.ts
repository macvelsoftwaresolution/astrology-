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

  fetchPrediction(rasiName: string) {
    const today = new Date().toISOString().split('T')[0];
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/rasi-palan?date=${today}&type=${this.selectedRasiTab}`).subscribe({
      next: (res) => {
        const list = res?.predictions || res?.palans || (Array.isArray(res) ? res : []);
        const found = list.find((r: any) => r.rasi_name === rasiName);
        if (found) {
          this.predictionData = found;
        } else {
          this.predictionData = {
            rasi_name: rasiName,
            prediction_text: 'இன்றைய ராசி பலன் விரைவில் வெளியிடப்படும்.',
            audio_url: null,
            video_url: null
          };
        }
        this.isLoading = false;
      },
      error: () => {
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
