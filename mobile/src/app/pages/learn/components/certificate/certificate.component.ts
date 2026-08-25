import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-learn-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
  standalone: false
})
export class LearnCertificateComponent implements OnInit {
  @Input() enrollForm: any;
  @Output() close = new EventEmitter<void>();

  certificates: any[] = [];
  selectedCert: any = null;
  isLoading = false;
  currentUser: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser('education') || this.authService.getCurrentUser('astrology');
    this.loadCertificates();
  }

  get token() {
    return this.authService.getToken('education') || this.authService.getToken('astrology') || '';
  }

  loadCertificates() {
    this.isLoading = true;
    const headers = { headers: { Authorization: `Bearer ${this.token}` } };
    this.http.get<any>(`${environment.apiUrl}/user/certificates`, headers).subscribe({
      next: (res) => {
        if (res && res.certificates && Array.isArray(res.certificates)) {
          this.certificates = res.certificates;
          if (this.certificates.length > 0) {
            this.selectedCert = this.certificates[0];
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectCertificate(cert: any) {
    this.selectedCert = cert;
  }

  downloadCertificate(cert: any) {
    const url = cert?.pdf_download_url;
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('சான்றிதழ் பதிவிறக்க இணைப்பு கிடைக்கவில்லை (Download link not available)');
    }
  }

  shareCertificate(cert: any) {
    const url = cert?.pdf_download_url || window.location.href;
    const title = cert?.course_title || 'சாதனைச் சான்றிதழ்';
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title} சான்றிதழ்`,
        url: url
      }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          alert('சான்றிதழ் இணைப்பு நகலெடுக்கப்பட்டது (Certificate link copied to clipboard)');
        });
      } else {
        alert(url);
      }
    }
  }
}
