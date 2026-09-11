import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslationService } from '../../../../services/translation.service';
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
    private authService: AuthService,
    private toastService: ToastService,
    public translationService: TranslationService
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
    const token = this.token;
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    this.http.get<any>(`${environment.apiUrl}/user/certificates`, headers).subscribe({
      next: (res) => {
        if (res && res.certificates && Array.isArray(res.certificates)) {
          // Strictly keep only certificates published by admin
          this.certificates = res.certificates.filter((c: any) => c.is_published == 1 || c.is_published === true || c.published == 1);
          this.certificates.forEach((c: any) => {
            if (c.custom_data) {
              try {
                const cd = typeof c.custom_data === 'string' ? JSON.parse(c.custom_data) : c.custom_data;
                c.has_mcq2 = cd.has_mcq2 ?? false;
                c.has_practicals = cd.has_practicals ?? false;
                c.has_practical2 = cd.has_practical2 ?? false;
                c.has_practical3 = cd.has_practical3 ?? false;
                c.pass_criteria_theory = cd.pass_criteria_theory || c.pass_criteria_theory;
                c.pass_criteria_practical = cd.pass_criteria_practical || c.pass_criteria_practical;
              } catch (e) {}
            } else {
              c.has_mcq2 = false;
              c.has_practicals = false;
              c.has_practical2 = false;
              c.has_practical3 = false;
            }
          });

          if (this.certificates.length > 0) {
            this.selectedCert = this.certificates[0];
          } else {
            this.selectedCert = null;
          }
        } else {
          this.certificates = [];
          this.selectedCert = null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.certificates = [];
        this.selectedCert = null;
        this.isLoading = false;
      }
    });
  }

  selectCertificate(cert: any) {
    this.selectedCert = cert;
    this.enrichCertFlags(this.selectedCert);
  }

  private enrichCertFlags(c: any) {
    if (!c) return;
    if (c.custom_data) {
      try {
        const cd = typeof c.custom_data === 'string' ? JSON.parse(c.custom_data) : c.custom_data;
        c.has_mcq2 = cd.has_mcq2 ?? false;
        c.has_practicals = cd.has_practicals ?? false;
        c.has_practical2 = cd.has_practical2 ?? false;
        c.has_practical3 = cd.has_practical3 ?? false;
        c.pass_criteria_theory = cd.pass_criteria_theory || c.pass_criteria_theory;
        c.pass_criteria_practical = cd.pass_criteria_practical || c.pass_criteria_practical;
      } catch (e) {}
    }
  }

  get studentName(): string {
    return this.selectedCert?.student_name || this.currentUser?.name || this.currentUser?.fullName || this.enrollForm?.fullName || '';
  }

  get hasCertificateDoc(): boolean {
    if (!this.selectedCert) return false;
    const cert = this.selectedCert;
    const isPub = (cert.is_published == 1 || cert.is_published === true || cert.published == 1);
    if (!isPub) return false;
    return !!(cert.pdf_download_url || cert.cert_pdf_url || cert.pdf_url || cert.file_url || cert.url || cert.certificate_number);
  }

  get hasMarksheetDoc(): boolean {
    if (!this.selectedCert) return false;
    const cert = this.selectedCert;
    const isPub = (cert.is_published == 1 || cert.is_published === true || cert.published == 1);
    if (!isPub) return false;
    return !!(cert.marksheet_download_url || cert.marksheet_url || cert.marksheet_number);
  }

  getCertificateDownloadUrl(cert?: any): string {
    const target = cert || this.selectedCert;
    if (!target) return '';
    const certId = target.id || target.certificate_number || target.registration_number;
    return `${environment.apiUrl}/certificates/${certId}/download?type=certificate`;
  }

  getMarksheetDownloadUrl(cert?: any): string {
    const target = cert || this.selectedCert;
    if (!target) return '';
    const certId = target.id || target.marksheet_number || target.certificate_number || target.registration_number;
    return `${environment.apiUrl}/marksheets/${certId}/download?type=marksheet`;
  }

  downloadCertificate(cert?: any) {
    const url = this.getCertificateDownloadUrl(cert);
    const target = cert || this.selectedCert;
    const name = target?.award_title_ta || target?.course_title || 'சான்றிதழ் (Certificate)';
    this.downloadDocument(url, name);
  }

  shareCertificate(cert?: any) {
    const url = this.getCertificateDownloadUrl(cert);
    const target = cert || this.selectedCert;
    const name = `ஸ்ரீ ஆருத்ரா ஜோதிட சாஸ்திர வித்யாலயம் - ${target?.award_title_ta || 'சான்றிதழ்'}`;
    this.shareDocument(url, name);
  }

  downloadMarksheet(cert?: any) {
    const url = this.getMarksheetDownloadUrl(cert);
    const target = cert || this.selectedCert;
    const name = target?.course_title ? `${target.course_title} Marksheet` : 'மதிப்பெண் பட்டியல் (Marksheet)';
    this.downloadDocument(url, name);
  }

  shareMarksheet(cert?: any) {
    const url = this.getMarksheetDownloadUrl(cert);
    const target = cert || this.selectedCert;
    const name = `ஸ்ரீ ஆருத்ரா ஜோதிட தேர்வு மதிப்பெண் பட்டியல் - ${target?.registration_number || ''}`;
    this.shareDocument(url, name);
  }

  downloadDocument(docUrl: string, docName: string) {
    const isTa = this.translationService.currentLanguage() === 'ta';
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      const prefix = docName ? `${docName} ` : '';
      const msg = isTa ? `${prefix}பதிவிறக்க இணைப்பு கிடைக்கவில்லை.` : `${prefix}Download link not available.`;
      this.toastService.warning(msg);
    }
  }

  shareDocument(docUrl: string, title: string) {
    const isTa = this.translationService.currentLanguage() === 'ta';
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
          this.toastService.success(isTa ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
        });
      } else {
        this.toastService.info(url);
      }
    }
  }
}
