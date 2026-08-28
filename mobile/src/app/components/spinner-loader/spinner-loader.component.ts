import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-spinner-loader',
  standalone: false,
  template: `
    <div *ngIf="isLoading" class="mobile-floating-loader-capsule">
      <div class="mini-celestial-spinner"></div>
      <span class="mobile-loader-text">ஏற்றப்படுகிறது...</span>
    </div>
  `,
  styles: [`
    .mobile-floating-loader-capsule {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 16px;
      background: rgba(26, 6, 42, 0.92);
      border: 1px solid rgba(230, 198, 135, 0.55);
      border-radius: 50px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 168, 79, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      pointer-events: none;
      animation: capsuleSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .mini-celestial-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(212, 168, 79, 0.2);
      border-top-color: #E6C687;
      border-right-color: #C5A059;
      border-radius: 50%;
      animation: capsuleSpin 0.9s linear infinite;
    }

    .mobile-loader-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: #FAF5EC;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    @keyframes capsuleSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes capsuleSlideDown {
      0% { opacity: 0; transform: translate(-50%, -12px) scale(0.95); }
      100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
  `]
})
export class SpinnerLoaderComponent implements OnInit, OnDestroy {
  isLoading = false;
  private sub!: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.sub = this.loadingService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
