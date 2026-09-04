import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-certificates-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './certificates-tab.html',
  styleUrls: ['../../admin-dashboard.css', './certificates-tab.css']
})
export class CertificatesTabComponent implements OnInit {
  activeTab: 'certificates' | 'marksheets' = 'certificates';
  issuedCertificates: any[] = [];
  studentsList: any[] = [];
  coursesList: any[] = [];
  
  isLoading = false;
  showUploadForm = false;
  uploadType: 'certificate' | 'marksheet' = 'certificate';
  isUploadingFile = false;

  directCertForm = {
    student_id: '',
    course_id: '',
    pdf_download_url: '',
    score: null as number | null,
    grade: '',
    issue_date: new Date().toISOString().split('T')[0],
    certificate_number: ''
  };

  directMarksheetForm = {
    student_id: '',
    course_id: '',
    marksheet_download_url: '',
    score: null as number | null,
    grade: '',
    issue_date: new Date().toISOString().split('T')[0],
    marksheet_number: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadIssuedCertificates();
      this.loadStudentsAndCourses();
    }
  }

  loadIssuedCertificates(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/certificates`, headers).subscribe({
      next: (res) => {
        this.issuedCertificates = res.certificates || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadStudentsAndCourses(): void {
    const headers = this.authService.getAuthHeaders();
    
    // 1. Fetch Students
    this.http.get<any>(`${environment.apiUrl}/admin/users`, headers).subscribe({
      next: (res) => {
        const users = res.users || res || [];
        this.studentsList = Array.isArray(users)
          ? users.filter((u: any) => !!u.student_id && u.student_id.trim() !== '')
          : [];
        if (this.studentsList.length > 0) {
          if (!this.directCertForm.student_id) this.directCertForm.student_id = this.studentsList[0].id;
          if (!this.directMarksheetForm.student_id) this.directMarksheetForm.student_id = this.studentsList[0].id;
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });

    // 2. Fetch Courses
    this.http.get<any>(`${environment.apiUrl}/admin/courses`, headers).subscribe({
      next: (res) => {
        const courses = res.courses || res || [];
        this.coursesList = Array.isArray(courses) ? courses : [];
        if (this.coursesList.length > 0) {
          if (!this.directCertForm.course_id) this.directCertForm.course_id = this.coursesList[0].id;
          if (!this.directMarksheetForm.course_id) this.directMarksheetForm.course_id = this.coursesList[0].id;
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  toggleUploadForm(type?: 'certificate' | 'marksheet'): void {
    if (type) {
      this.uploadType = type;
      this.showUploadForm = true;
    } else {
      this.showUploadForm = !this.showUploadForm;
    }
  }

  onCertificateFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.authService.getUploadHeaders();

    this.http.post<any>(`${environment.apiUrl}/upload`, formData, headers).subscribe({
      next: (res) => {
        this.isUploadingFile = false;
        if (res.url) {
          this.directCertForm.pdf_download_url = res.url;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingFile = false;
        this.toastService.error('கோப்பு பதிவேற்றுவதில் பிழை ஏற்பட்டது.');
        this.cdr.markForCheck();
      }
    });
  }

  onMarksheetFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.authService.getUploadHeaders();

    this.http.post<any>(`${environment.apiUrl}/upload`, formData, headers).subscribe({
      next: (res) => {
        this.isUploadingFile = false;
        if (res.url) {
          this.directMarksheetForm.marksheet_download_url = res.url;
          this.toastService.success('மதிப்பெண் கோப்பு பதிவேற்றப்பட்டது!', 'வெற்றி');
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingFile = false;
        this.toastService.error('கோப்பு பதிவேற்றுவதில் பிழை ஏற்பட்டது.');
        this.cdr.markForCheck();
      }
    });
  }

  submitDirectCertificate(): void {
    if (!this.directCertForm.student_id || !this.directCertForm.pdf_download_url) {
      this.toastService.warning('மாணவர் மற்றும் சான்றிதழ் கோப்பை தேர்வு செய்யவும்.', 'விவரங்கள் தேவை');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/certificates`, this.directCertForm, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'சான்றிதழ் வெற்றிகரமாக வழங்கப்பட்டது!');
        this.showUploadForm = false;
        this.loadIssuedCertificates();
      },
      error: () => this.toastService.error('சான்றிதழ் வழங்குவதில் பிழை.')
    });
  }

  submitDirectMarksheet(): void {
    if (!this.directMarksheetForm.student_id || !this.directMarksheetForm.marksheet_download_url) {
      this.toastService.warning('மாணவர் மற்றும் மதிப்பெண் சான்றிதழ் கோப்பை தேர்வு செய்யவும்.', 'விவரங்கள் தேவை');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/marksheets`, this.directMarksheetForm, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'மதிப்பெண் சான்றிதழ் வெற்றிகரமாக வழங்கப்பட்டது!');
        this.showUploadForm = false;
        this.loadIssuedCertificates();
      },
      error: () => this.toastService.error('மதிப்பெண் சான்றிதழ் வழங்குவதில் பிழை.')
    });
  }

  async deleteRecord(id: number): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'பதிவை நீக்கவா?',
      message: 'இந்த சான்றிதழ் / மதிப்பெண் பதிவு நிரந்தரமாக நீக்கப்படும். நிச்சயமாக நீக்க வேண்டுமா?',
      confirmText: 'ஆம், நீக்குக',
      type: 'danger',
      icon: 'bi bi-trash3-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/certificates/${id}`, headers).subscribe({
      next: () => {
        this.toastService.success('பதிவு வெற்றிகரமாக நீக்கப்பட்டது.');
        this.loadIssuedCertificates();
      },
      error: () => this.toastService.error('நீக்குவதில் பிழை.')
    });
  }
}
