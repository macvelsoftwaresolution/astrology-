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
  templateUrl: './grading-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './grading-tab.component.css']
})
export class GradingTabComponent implements OnInit {
  activeTab: 'submissions' | 'issued' = 'submissions';
  submissions: any[] = [];
  issuedCertificates: any[] = [];
  studentsList: any[] = [];
  coursesList: any[] = [];
  
  isLoading = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = { score: 85, status: 'Approved', evaluator_notes: 'Great work.' };

  showUploadForm = false;
  isUploadingFile = false;
  directCertForm = {
    student_id: '',
    course_id: '',
    pdf_download_url: '',
    score: 100,
    issue_date: new Date().toISOString().split('T')[0],
    certificate_number: ''
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadIssuedCertificates(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/certificates`, headers).subscribe({
      next: (res) => {
        this.issuedCertificates = res.certificates || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadStudentsAndCourses(): void {
    const headers = this.authService.getAuthHeaders();
    
    // 1. Fetch Students/Users
    this.http.get<any>(`${environment.apiUrl}/admin/users`, headers).subscribe({
      next: (res) => {
        const users = res.users || res || [];
        this.studentsList = Array.isArray(users) ? users.filter((u: any) => u.role === 'user' || !u.role) : [];
        if (this.studentsList.length > 0 && !this.directCertForm.student_id) {
          this.directCertForm.student_id = this.studentsList[0].id;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    // 2. Fetch Courses
    this.http.get<any>(`${environment.apiUrl}/admin/courses`, headers).subscribe({
      next: (res) => {
        const courses = res.courses || res || [];
        this.coursesList = Array.isArray(courses) ? courses : [];
        if (this.coursesList.length > 0 && !this.directCertForm.course_id) {
          this.directCertForm.course_id = this.coursesList[0].id;
        }
        this.cdr.detectChanges();
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

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (this.showUploadForm) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.directCertForm = {
        student_id: this.studentsList[0]?.id || '',
        course_id: this.coursesList[0]?.id || '',
        pdf_download_url: '',
        score: 100,
        issue_date: new Date().toISOString().split('T')[0],
        certificate_number: `ASTRO-CERT-${new Date().getFullYear()}-${randomNum}`
      };
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('கோப்பு பதிவேற்றம் தோல்வியடைந்தது: ' + (err.error?.message || 'Upload failed'));
        this.isUploadingFile = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitDirectCertificate(): void {
    if (!this.directCertForm.student_id) {
      alert('தயவுசெய்து மாணவரைத் தேர்ந்தெடுக்கவும் (Please select student)');
      return;
    }
    if (!this.directCertForm.pdf_download_url) {
      alert('தயவுசெய்து சான்றிதழ் கோப்பை (PDF/Image) பதிவேற்றவும் (Please upload certificate file)');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/certificates`, this.directCertForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'சான்றிதழ் வெற்றிகரமாகப் பதிவேற்றப்பட்டு மாணவருக்கு வழங்கப்பட்டது!');
        this.showUploadForm = false;
        this.loadIssuedCertificates();
      },
      error: (err) => {
        alert('சான்றிதழ் வழங்குவது தோல்வியடைந்தது: ' + (err.error?.message || 'Failed'));
      }
    });
  }

  deleteCertificate(id: number): void {
    if (!confirm('இந்த சான்றிதழை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Are you sure to revoke/delete this certificate?)')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/certificates/${id}`, headers).subscribe({
      next: (res) => {
        alert(res.message || 'சான்றிதழ் நீக்கப்பட்டது.');
        this.loadIssuedCertificates();
      },
      error: () => alert('சான்றிதழ் நீக்குவதில் தோல்வி.')
    });
  }
}
