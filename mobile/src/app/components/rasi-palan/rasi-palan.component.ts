import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rasi-palan',
  templateUrl: './rasi-palan.component.html',
  styleUrls: ['./rasi-palan.component.scss'],
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

  selectRasi(rasi: any) {
    this.selectedRasi = rasi;
    this.stopAudio();
  }

  closeDetail() {
    this.selectedRasi = null;
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
