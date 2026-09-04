import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-learn-certificate',
  templateUrl: './certificate.html',
  styleUrls: ['./certificate.scss'],
  standalone: false
})
export class LearnCertificateComponent implements OnInit {
  @Input() enrollForm: any;
  @Output() close = new EventEmitter<void>();

  activeDocumentTab: 'certificate' | 'marksheet' = 'certificate';
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

  get hasCertificateDoc(): boolean {
    if (!this.selectedCert) return false;
    const cert = this.selectedCert;
    return !!(cert.pdf_download_url || cert.cert_pdf_url || cert.pdf_url || cert.file_url || cert.url || cert.certificate_number);
  }

  get hasMarksheetDoc(): boolean {
    if (!this.selectedCert) return false;
    const cert = this.selectedCert;
    return !!(cert.marksheet_download_url || cert.marksheet_url);
  }

  downloadCertificate(cert?: any) {
    const target = cert || this.selectedCert;
    const fileUrl = target?.pdf_download_url || target?.cert_pdf_url || target?.pdf_url || target?.file_url || target?.url || '';
    const name = target?.course_title || 'Certificate';
    this.downloadDocument(fileUrl, name);
  }

  shareCertificate(cert?: any) {
    const target = cert || this.selectedCert;
    const fileUrl = target?.pdf_download_url || target?.cert_pdf_url || target?.pdf_url || target?.file_url || target?.url || '';
    const name = target?.course_title || 'Certificate';
    this.shareDocument(fileUrl, name);
  }

  downloadMarksheet(cert?: any) {
    const target = cert || this.selectedCert;
    const fileUrl = target?.marksheet_download_url || target?.marksheet_url || '';
    const name = (target?.course_title || 'Marksheet') + ' Marksheet';
    this.downloadDocument(fileUrl, name);
  }

  shareMarksheet(cert?: any) {
    const target = cert || this.selectedCert;
    const fileUrl = target?.marksheet_download_url || target?.marksheet_url || '';
    const name = (target?.course_title || 'Marksheet') + ' Marksheet';
    this.shareDocument(fileUrl, name);
  }

  downloadDocument(docUrl: string, fallbackName: string) {
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      alert(`${fallbackName} பதிவிறக்க இணைப்பு கிடைக்கவில்லை (Download link not available)`);
    }
  }

  shareDocument(docUrl: string, title: string) {
    const url = docUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: title,
        url: url
      }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          alert('இணைப்பு நகலெடுக்கப்பட்டது (Link copied to clipboard)');
        });
      } else {
        alert(url);
      }
    }
  }
}
