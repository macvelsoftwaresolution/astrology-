import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-grading-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './grading-tab.html',
  styleUrls: ['../../admin-dashboard.css', './grading-tab.css']
})
export class GradingTabComponent implements OnInit {
  activeTab: 'submissions' | 'certificates' | 'marksheets' = 'certificates';
  submissions: any[] = [];
  issuedCertificates: any[] = [];
  studentsList: any[] = [];
  coursesList: any[] = [];
  
  isLoading = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = { score: 85, status: 'Approved', evaluator_notes: 'Great work.' };

  showUploadForm = false;
  uploadType: 'certificate' | 'marksheet' = 'certificate';
  isUploadingFile = false;

  directCertForm = {
    student_id: '',
    course_id: '',
    pdf_download_url: '',
    score: 100,
    grade: 'Distinction',
    issue_date: new Date().toISOString().split('T')[0],
    certificate_number: ''
  };

  directMarksheetForm = {
    student_id: '',
    course_id: '',
    marksheet_download_url: '',
    score: 85,
    grade: 'First Class',
    issue_date: new Date().toISOString().split('T')[0],
    marksheet_number: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadSubmissions();
      this.loadIssuedCertificates();
      this.loadStudentsAndCourses();
    }
  }

  loadSubmissions(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/submissions`, headers).subscribe({
      next: (res) => {
        this.submissions = res.submissions || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadIssuedCertificates(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/certificates`, headers).subscribe({
      next: (res) => {
        this.issuedCertificates = res.certificates || [];
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadStudentsAndCourses(): void {
    const headers = this.authService.getAuthHeaders();
    
    // 1. Fetch Students (Only users with student_id)
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

  openGradingModal(sub: any): void {
    this.selectedSubmissionForGrading = sub;
    this.gradingForm = {
      score: sub.score !== null && sub.score !== undefined ? sub.score : 85,
      status: sub.status === 'Approved' ? 'Approved' : 'Approved',
      evaluator_notes: sub.evaluator_notes || 'Excellent grasp of Vedic astrology concepts.'
    };
  }

  saveGrading(): void {
    if (!this.selectedSubmissionForGrading) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/${this.selectedSubmissionForGrading.id}/evaluate`, this.gradingForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Exam evaluated and certificate issued successfully!');
        this.selectedSubmissionForGrading = null;
        this.loadSubmissions();
        this.loadIssuedCertificates();
      },
      error: () => alert('Failed to evaluate exam.')
    });
  }

  toggleUploadForm(type?: 'certificate' | 'marksheet'): void {
    if (type) {
      this.uploadType = type;
      this.showUploadForm = true;
    } else {
      this.showUploadForm = !this.showUploadForm;
    }

    if (this.showUploadForm) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      if (this.uploadType === 'certificate') {
        this.directCertForm = {
          student_id: this.studentsList[0]?.id || '',
          course_id: this.coursesList[0]?.id || '',
          pdf_download_url: '',
          score: 100,
          grade: 'Distinction',
          issue_date: new Date().toISOString().split('T')[0],
          certificate_number: `ASTRO-CERT-${new Date().getFullYear()}-${randomNum}`
        };
      } else {
        this.directMarksheetForm = {
          student_id: this.studentsList[0]?.id || '',
          course_id: this.coursesList[0]?.id || '',
          marksheet_download_url: '',
          score: 85,
          grade: 'First Class',
          issue_date: new Date().toISOString().split('T')[0],
          marksheet_number: `ASTRO-MRK-${new Date().getFullYear()}-${randomNum}`
        };
      }
    }
  }

  onCertificateFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'certificates');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.directCertForm.pdf_download_url = res.url;
        }
        this.isUploadingFile = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert('Upload failed: ' + (err.error?.message || 'Server error'));
        this.isUploadingFile = false;
        this.cdr.markForCheck();
      }
    });
  }

  onMarksheetFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'marksheets');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.directMarksheetForm.marksheet_download_url = res.url;
        }
        this.isUploadingFile = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert('Upload failed: ' + (err.error?.message || 'Server error'));
        this.isUploadingFile = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitDirectCertificate(): void {
    if (!this.directCertForm.student_id || !this.directCertForm.pdf_download_url) {
      alert('Please select a student and upload the Certificate PDF file.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/certificates`, this.directCertForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Certificate issued and uploaded successfully!');
        this.showUploadForm = false;
        this.loadIssuedCertificates();
      },
      error: (err) => alert(err.error?.message || 'Failed to issue certificate.')
    });
  }

  submitDirectMarksheet(): void {
    if (!this.directMarksheetForm.student_id || !this.directMarksheetForm.marksheet_download_url) {
      alert('Please select a student and upload the Mark Sheet PDF file.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/marksheets`, this.directMarksheetForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Mark Sheet issued and uploaded successfully!');
        this.showUploadForm = false;
        this.loadIssuedCertificates();
      },
      error: (err) => alert(err.error?.message || 'Failed to issue mark sheet.')
    });
  }

  deleteCertificate(id: number): void {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/certificates/${id}`, headers).subscribe({
      next: () => {
        this.loadIssuedCertificates();
      },
      error: () => alert('Failed to delete.')
    });
  }

  get certificatesOnly(): any[] {
    return this.issuedCertificates.filter(c => !!c.pdf_download_url);
  }

  get marksheetsOnly(): any[] {
    return this.issuedCertificates.filter(c => !!c.marksheet_download_url);
  }
}
