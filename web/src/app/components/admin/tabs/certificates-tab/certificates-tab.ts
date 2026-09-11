import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { environment } from '../../../../../environments/environment';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

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
  studentSubmissions: any[] = [];
  
  isLoading = false;
  showDesignerModal = false;
  showQuickUpload = false;
  previewTab: 'certificate' | 'marksheet' = 'certificate';
  previewScale: number = 0.85;
  isUploadingFile = false;
  isSaving = false;

  // Custom Full Certificate & Marksheet Form
  designerForm = {
    id: null as number | null,
    student_id: '',
    course_id: '',
    course_level: 'UG' as 'UG' | 'PG',
    student_name_ta: '',
    student_name_en: '',
    photo_url: '',
    registration_number: '',
    center_name: 'பல்லடம்',
    center_name_en: 'PALLADAM',
    course_period_from: '06.02.2018',
    course_period_to: '06.02.2019',
    exam_date: '28.01.2019',
    academic_year: '2018 FEB to 2019 FEB',
    award_title_ta: 'ஜோதிட ரத்னா',
    award_title_en: 'JOTHIDA RATHNA',
    issue_date: '28.10.2019',
    issue_place: 'பெரியகுளம்',
    certificate_number: '',
    marksheet_number: '',
    has_mcq2: false,
    has_practicals: false,
    has_practical2: false,
    has_practical3: false,
    theory1_mark: 98,
    theory1_status: 'PASS',
    theory2_mark: 90,
    theory2_status: 'PASS',
    practical1_mark: 92,
    practical1_status: 'PASS',
    practical2_mark: 87,
    practical2_status: 'PASS',
    practical3_mark: 93,
    practical3_status: 'PASS',
    total_marks: 98,
    percentage: '98%',
    grade: 'Distinction',
    pass_status: 'PASS',
    pass_criteria_theory: 'Minimum for pass: - 35% Marks (MCQ / Theory) out of 100 obtained the marks.',
    pass_criteria_practical: 'Minimum for pass: - 50% Marks (practical) out of in the Work Book Subject out of 100 obtained the marks.',
    pdf_download_url: '',
    marksheet_download_url: ''
  };

  // Quick Direct Upload
  uploadType: 'certificate' | 'marksheet' = 'certificate';
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
      this.loadSubmissions();
    }
  }

  loadSubmissions(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/submissions`, headers).subscribe({
      next: (res) => {
        this.studentSubmissions = res.submissions || [];
        if (this.designerForm.student_id) {
          this.fetchMarksForStudent(this.designerForm.student_id, this.designerForm.course_level);
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
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
        if (this.studentsList.length > 0 && !this.designerForm.student_id) {
          this.onStudentSelect(this.studentsList[0].id);
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
        if (this.coursesList.length > 0 && !this.designerForm.course_id) {
          this.designerForm.course_id = this.coursesList[0].id;
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  openDesignerModal(level: 'UG' | 'PG' = 'UG', existingRecord: any = null): void {
    if (existingRecord) {
      this.populateFromRecord(existingRecord);
    } else {
      this.resetDesignerForm(level);
    }
    this.showDesignerModal = true;
    this.cdr.markForCheck();
  }

  fetchMarksForStudent(studentId: any, level?: 'UG' | 'PG'): void {
    if (!studentId) return;
    const st = this.studentsList.find(s => s.id == studentId);
    if (st) {
      this.designerForm.student_name_ta = st.name || '';
      this.designerForm.student_name_en = st.name ? st.name.toUpperCase() : '';
      this.designerForm.registration_number = st.student_id || this.designerForm.registration_number;
      this.designerForm.certificate_number = st.student_id || this.designerForm.certificate_number;
      if (st.profile_photo_url) {
        this.designerForm.photo_url = st.profile_photo_url;
      }
    }

    // Match submission from studentSubmissions list
    const sub = this.studentSubmissions.find(s => 
      s.student_id == studentId || 
      s.user_id == studentId || 
      (st && s.student_code && s.student_code === st.student_id)
    );

    if (sub) {
      const mcqScore = (sub.mcq_score !== null && sub.mcq_score !== undefined) 
        ? Number(sub.mcq_score) 
        : (sub.score !== null && sub.score !== undefined ? Number(sub.score) : null);
      
      const pracScore = (sub.practical_score !== null && sub.practical_score !== undefined)
        ? Number(sub.practical_score)
        : null;

      if (mcqScore !== null) {
        this.designerForm.theory1_mark = mcqScore;
      }

      if (pracScore !== null && pracScore > 0) {
        this.designerForm.has_practicals = true;
        this.designerForm.practical1_mark = pracScore;
      } else {
        this.designerForm.has_practicals = false;
      }

      if (sub.created_at || sub.submitted_at || sub.exam_date) {
        const d = new Date(sub.exam_date || sub.submitted_at || sub.created_at);
        if (!isNaN(d.getTime())) {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          this.designerForm.exam_date = `${dd}.${mm}.${yyyy}`;
        }
      }
    }

    this.calculateMarks();
    this.cdr.markForCheck();
  }

  resetDesignerForm(level: 'UG' | 'PG'): void {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const selectedStudent = this.studentsList.find(s => s.id == this.designerForm.student_id) || this.studentsList[0];

    if (level === 'UG') {
      this.designerForm = {
        id: null,
        student_id: selectedStudent ? selectedStudent.id : '',
        course_id: this.coursesList.length > 0 ? this.coursesList[0].id : '',
        course_level: 'UG',
        student_name_ta: selectedStudent?.name || 'த. பாலுசாமி',
        student_name_en: selectedStudent?.name ? selectedStudent.name.toUpperCase() : 'D. BALUSAMY',
        photo_url: selectedStudent?.profile_photo_url || null,
        registration_number: selectedStudent?.student_id || '05180200004',
        center_name: 'பல்லடம்',
        center_name_en: 'PALLADAM',
        course_period_from: '06.02.2018',
        course_period_to: '06.02.2019',
        exam_date: '28.01.2019',
        academic_year: '2018 FEB to 2019 FEB',
        award_title_ta: 'ஜோதிட ரத்னா',
        award_title_en: 'JOTHIDA RATHNA',
        issue_date: '28.10.2019',
        issue_place: 'பெரியகுளம்',
        certificate_number: '05180200004',
        marksheet_number: 'MRK-UG-2019-' + randomNum,
        has_mcq2: false,
        has_practicals: false,
        has_practical2: false,
        has_practical3: false,
        theory1_mark: 98,
        theory1_status: 'PASS',
        theory2_mark: 90,
        theory2_status: 'PASS',
        practical1_mark: 92,
        practical1_status: 'PASS',
        practical2_mark: 87,
        practical2_status: 'PASS',
        practical3_mark: 93,
        practical3_status: 'PASS',
        total_marks: 98,
        percentage: '98%',
        grade: 'Distinction',
        pass_status: 'PASS',
        pass_criteria_theory: 'Minimum for pass: - 35% Marks (MCQ / Theory) out of 100 obtained the marks.',
        pass_criteria_practical: 'Minimum for pass: - 50% Marks (practical) out of in the Work Book Subject out of 100 obtained the marks.',
        pdf_download_url: '',
        marksheet_download_url: ''
      };
    } else {
      this.designerForm = {
        id: null,
        student_id: selectedStudent ? selectedStudent.id : '',
        course_id: this.coursesList.length > 0 ? this.coursesList[0].id : '',
        course_level: 'PG',
        student_name_ta: selectedStudent?.name || 'ம. திருநிறைச்செல்வி',
        student_name_en: selectedStudent?.name ? selectedStudent.name.toUpperCase() : 'M. THIRUNIRAISELVI',
        photo_url: selectedStudent?.profile_photo_url || null,
        registration_number: selectedStudent?.student_id || '05180200005',
        center_name: 'பல்லடம்',
        center_name_en: 'PALLADAM',
        course_period_from: '06.02.2019',
        course_period_to: '06.02.2020',
        exam_date: '07.02.2020',
        academic_year: '2019 FEB to 2020 FEB',
        award_title_ta: 'ஜோதிட கலாநிதி',
        award_title_en: 'JOTHIDA KALANITHI',
        issue_date: '10.02.2020',
        issue_place: 'பெரியகுளம்',
        certificate_number: '05180200005',
        marksheet_number: 'MRK-PG-2020-' + randomNum,
        has_mcq2: false,
        has_practicals: false,
        has_practical2: false,
        has_practical3: false,
        theory1_mark: 85,
        theory1_status: 'PASS',
        theory2_mark: 75,
        theory2_status: 'PASS',
        practical1_mark: 120,
        practical1_status: 'PASS',
        practical2_mark: 70,
        practical2_status: 'PASS',
        practical3_mark: 120,
        practical3_status: 'PASS',
        total_marks: 85,
        percentage: '85%',
        grade: 'GRADE - I',
        pass_status: 'PASS',
        pass_criteria_theory: 'Minimum for pass: - 35% Marks (MCQ / Theory) out of 100 obtained the marks.',
        pass_criteria_practical: 'Minimum for pass: - 70% Marks (practical) out of in the Work Book I & III Subject out of 400 Obtained the marks.',
        pdf_download_url: '',
        marksheet_download_url: ''
      };
    }
    if (selectedStudent) {
      this.fetchMarksForStudent(selectedStudent.id, level);
    } else {
      this.calculateMarks();
    }
  }

  populateFromRecord(rec: any): void {
    const isPG = (rec.course_level === 'PG');
    let customData: any = {};
    if (rec.custom_data) {
      try {
        customData = typeof rec.custom_data === 'string' ? JSON.parse(rec.custom_data) : rec.custom_data;
      } catch (e) {}
    }
    const hasMcq2 = customData.has_mcq2 !== undefined 
      ? !!customData.has_mcq2 
      : (rec.theory2_mark !== null && rec.theory2_mark !== undefined && Number(rec.theory2_mark) > 0);
    const hasPracticals = customData.has_practicals !== undefined 
      ? !!customData.has_practicals 
      : (rec.practical1_mark !== null && rec.practical1_mark !== undefined && Number(rec.practical1_mark) > 0);
    const hasPractical2 = customData.has_practical2 !== undefined 
      ? !!customData.has_practical2 
      : (rec.practical2_mark !== null && rec.practical2_mark !== undefined && Number(rec.practical2_mark) > 0);
    const hasPractical3 = customData.has_practical3 !== undefined 
      ? !!customData.has_practical3 
      : (rec.practical3_mark !== null && rec.practical3_mark !== undefined && Number(rec.practical3_mark) > 0);

    this.designerForm = {
      id: rec.id,
      student_id: rec.student_id,
      course_id: rec.course_id,
      course_level: (rec.course_level || 'UG') as 'UG' | 'PG',
      student_name_ta: rec.student_name_ta || rec.student_name || '',
      student_name_en: rec.student_name_en || rec.student_name || '',
      photo_url: rec.photo_url || null,
      registration_number: rec.registration_number || rec.student_reg_id || '',
      center_name: rec.center_name || 'பல்லடம்',
      center_name_en: rec.center_name_en || 'PALLADAM',
      course_period_from: rec.course_period_from || (isPG ? '06.02.2019' : '06.02.2018'),
      course_period_to: rec.course_period_to || (isPG ? '06.02.2020' : '06.02.2019'),
      exam_date: rec.exam_date || (isPG ? '07.02.2020' : '28.01.2019'),
      academic_year: rec.academic_year || (isPG ? '2019 FEB to 2020 FEB' : '2018 FEB to 2019 FEB'),
      award_title_ta: rec.award_title_ta || (isPG ? 'ஜோதிட கலாநிதி' : 'ஜோதிட ரத்னா'),
      award_title_en: rec.award_title_en || (isPG ? 'JOTHIDA KALANITHI' : 'JOTHIDA RATHNA'),
      issue_date: rec.issue_date || (isPG ? '10.02.2020' : '28.10.2019'),
      issue_place: rec.issue_place || 'பெரியகுளம்',
      certificate_number: rec.certificate_number || '',
      marksheet_number: rec.marksheet_number || '',
      has_mcq2: hasMcq2,
      has_practicals: hasPracticals,
      has_practical2: hasPractical2,
      has_practical3: hasPractical3,
      theory1_mark: rec.theory1_mark ?? (isPG ? 85 : 98),
      theory1_status: rec.theory1_status || 'PASS',
      theory2_mark: rec.theory2_mark ?? (isPG ? 75 : 90),
      theory2_status: rec.theory2_status || 'PASS',
      practical1_mark: rec.practical1_mark ?? (isPG ? 120 : 92),
      practical1_status: rec.practical1_status || 'PASS',
      practical2_mark: rec.practical2_mark ?? (isPG ? 70 : 87),
      practical2_status: rec.practical2_status || 'PASS',
      practical3_mark: rec.practical3_mark ?? (isPG ? 120 : 93),
      practical3_status: rec.practical3_status || 'PASS',
      total_marks: rec.total_marks ?? (rec.score || (isPG ? 85 : 98)),
      percentage: rec.percentage || (isPG ? '85%' : '98%'),
      grade: rec.grade || (isPG ? 'GRADE - I' : 'Distinction'),
      pass_status: rec.pass_status || 'PASS',
      pass_criteria_theory: 'Minimum for pass: - 35% Marks (MCQ / Theory) out of 100 obtained the marks.',
      pass_criteria_practical: isPG 
        ? 'Minimum for pass: - 70% Marks (practical) out of in the Work Book I & III Subject out of 400 Obtained the marks.'
        : 'Minimum for pass: - 50% Marks (practical) out of in the Work Book Subject out of 100 obtained the marks.',
      pdf_download_url: rec.pdf_download_url || '',
      marksheet_download_url: rec.marksheet_download_url || ''
    };
  }

  onStudentSelect(studentId: any): void {
    this.designerForm.student_id = studentId;
    this.fetchMarksForStudent(studentId, this.designerForm.course_level);
  }

  setCourseLevel(level: 'UG' | 'PG'): void {
    this.designerForm.course_level = level;
    if (level === 'UG') {
      this.designerForm.award_title_ta = 'ஜோதிட ரத்னா';
      this.designerForm.award_title_en = 'JOTHIDA RATHNA';
      this.designerForm.grade = 'Distinction';
      this.designerForm.pass_criteria_theory = 'Minimum for pass: - 35% Marks (theory) out of in the divisional Subject out of 100 obtained the marks.';
      this.designerForm.pass_criteria_practical = 'Minimum for pass: - 50% Marks (practical) out of in the Work Book Subject out of 100 obtained the marks.';
      if (this.designerForm.course_period_from === '06.02.2019') {
        this.designerForm.course_period_from = '06.02.2018';
        this.designerForm.course_period_to = '06.02.2019';
        this.designerForm.exam_date = '28.01.2019';
        this.designerForm.issue_date = '28.10.2019';
        this.designerForm.academic_year = '2018 FEB to 2019 FEB';
      }
    } else {
      this.designerForm.award_title_ta = 'ஜோதிட கலாநிதி';
      this.designerForm.award_title_en = 'JOTHIDA KALANITHI';
      this.designerForm.grade = 'GRADE - II';
      this.designerForm.pass_criteria_theory = 'Minimum for pass: - 35% Marks (theory) out of in the divisional Subject out of 100 obtained the marks.';
      this.designerForm.pass_criteria_practical = 'Minimum for pass: - 70% Marks (practical) out of in the Work Book I & III Subject out of 400 Obtained the marks.';
      if (this.designerForm.course_period_from === '06.02.2018') {
        this.designerForm.course_period_from = '06.02.2019';
        this.designerForm.course_period_to = '06.02.2020';
        this.designerForm.exam_date = '07.02.2020';
        this.designerForm.issue_date = '10.02.2020';
        this.designerForm.academic_year = '2019 FEB to 2020 FEB';
      }
    }
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  addMCQ2(): void {
    this.designerForm.has_mcq2 = true;
    if (this.designerForm.theory2_mark === null || this.designerForm.theory2_mark === undefined || this.designerForm.theory2_mark === 0) {
      this.designerForm.theory2_mark = this.designerForm.course_level === 'PG' ? 75 : 90;
    }
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  removeMCQ2(): void {
    this.designerForm.has_mcq2 = false;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  addPracticals(): void {
    this.designerForm.has_practicals = true;
    this.designerForm.has_practical2 = false;
    this.designerForm.has_practical3 = false;
    if (!this.designerForm.practical1_mark) this.designerForm.practical1_mark = this.designerForm.course_level === 'PG' ? 80 : 92;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  removePracticals(): void {
    this.designerForm.has_practicals = false;
    this.designerForm.has_practical2 = false;
    this.designerForm.has_practical3 = false;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  addPractical2(): void {
    this.designerForm.has_practical2 = true;
    if (!this.designerForm.practical2_mark) this.designerForm.practical2_mark = this.designerForm.course_level === 'PG' ? 75 : 87;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  removePractical2(): void {
    this.designerForm.has_practical2 = false;
    this.designerForm.has_practical3 = false;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  addPractical3(): void {
    this.designerForm.has_practical3 = true;
    if (!this.designerForm.practical3_mark) this.designerForm.practical3_mark = this.designerForm.course_level === 'PG' ? 80 : 93;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  removePractical3(): void {
    this.designerForm.has_practical3 = false;
    this.calculateMarks();
    this.cdr.markForCheck();
  }

  calculateMarks(): void {
    const t1 = Number(this.designerForm.theory1_mark) || 0;
    const t2 = this.designerForm.has_mcq2 ? (Number(this.designerForm.theory2_mark) || 0) : 0;
    const p1 = this.designerForm.has_practicals ? (Number(this.designerForm.practical1_mark) || 0) : 0;
    const p2 = (this.designerForm.has_practicals && this.designerForm.has_practical2) ? (Number(this.designerForm.practical2_mark) || 0) : 0;
    const p3 = (this.designerForm.has_practicals && this.designerForm.has_practical3) ? (Number(this.designerForm.practical3_mark) || 0) : 0;

    const total = t1 + t2 + p1 + p2 + p3;
    this.designerForm.total_marks = total;

    if (this.designerForm.theory1_status !== 'ABSENT') {
      this.designerForm.theory1_status = (t1 >= 35) ? 'PASS' : 'FAIL';
    }
    if (this.designerForm.has_mcq2 && this.designerForm.theory2_status !== 'ABSENT') {
      this.designerForm.theory2_status = (t2 >= 35) ? 'PASS' : 'FAIL';
    }

    if (this.designerForm.has_practicals) {
      if (this.designerForm.practical1_status !== 'ABSENT') {
        this.designerForm.practical1_status = (p1 >= 50) ? 'PASS' : 'FAIL';
      }
      if (this.designerForm.has_practical2 && this.designerForm.practical2_status !== 'ABSENT') {
        this.designerForm.practical2_status = (p2 >= 50) ? 'PASS' : 'FAIL';
      }
      if (this.designerForm.has_practical3 && this.designerForm.practical3_status !== 'ABSENT') {
        this.designerForm.practical3_status = (p3 >= 50) ? 'PASS' : 'FAIL';
      }
    }

    // Dynamic Max Marks
    let maxMarks = 100;
    if (this.designerForm.has_mcq2) maxMarks += 100;
    if (this.designerForm.has_practicals) maxMarks += 100;
    if (this.designerForm.has_practicals && this.designerForm.has_practical2) maxMarks += 100;
    if (this.designerForm.has_practicals && this.designerForm.has_practical3) maxMarks += 100;

    const pct = Math.min(100, Math.round((total / maxMarks) * 100));
    this.designerForm.percentage = `${pct}%`;

    // Pass status
    let allPassed = (this.designerForm.theory1_status === 'PASS');
    if (this.designerForm.has_mcq2) {
      allPassed = allPassed && (this.designerForm.theory2_status === 'PASS');
    }
    if (this.designerForm.has_practicals) {
      allPassed = allPassed && (this.designerForm.practical1_status === 'PASS');
      if (this.designerForm.has_practical2) {
        allPassed = allPassed && (this.designerForm.practical2_status === 'PASS');
      }
      if (this.designerForm.has_practical3) {
        allPassed = allPassed && (this.designerForm.practical3_status === 'PASS');
      }
    }
    this.designerForm.pass_status = allPassed ? 'PASS' : 'FAIL';

    // Auto Grade
    if (!allPassed) {
      this.designerForm.grade = 'Fail';
    } else if (pct >= 85) {
      this.designerForm.grade = this.designerForm.course_level === 'PG' ? 'GRADE - I' : 'Distinction';
    } else if (pct >= 60) {
      this.designerForm.grade = this.designerForm.course_level === 'PG' ? 'GRADE - II' : 'First Class';
    } else if (pct >= 50) {
      this.designerForm.grade = 'Second Class';
    } else {
      this.designerForm.grade = 'Pass';
    }
  }

  onPhotoSelected(event: any): void {
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
          this.designerForm.photo_url = res.url;
          this.toastService.success('புகைப்படம் பதிவேற்றப்பட்டது!');
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingFile = false;
        this.toastService.error('புகைப்படம் பதிவேற்றுவதில் பிழை.');
        this.cdr.markForCheck();
      }
    });
  }

  saveCustomCertificate(): void {
    if (!this.designerForm.student_id) {
      this.toastService.warning('மாணவரை தேர்வு செய்யவும்.', 'விபரம் தேவை');
      return;
    }
    this.isSaving = true;
    const headers = this.authService.getAuthHeaders();

    const payload = {
      ...this.designerForm,
      score: parseInt(this.designerForm.percentage) || 100,
      custom_data: {
        has_mcq2: this.designerForm.has_mcq2,
        has_practicals: this.designerForm.has_practicals,
        has_practical2: this.designerForm.has_practical2,
        has_practical3: this.designerForm.has_practical3
      }
    };

    this.http.post<any>(`${environment.apiUrl}/admin/certificates/save-custom`, payload, headers).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.toastService.success(res.message || 'சான்றிதழ் & மதிப்பெண் பட்டியல் சேமிக்கப்பட்டது!', 'வெற்றி');
        this.showDesignerModal = false;
        this.loadIssuedCertificates();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSaving = false;
        this.toastService.error(err.error?.message || 'சேமிப்பதில் பிழை ஏற்பட்டது.');
        this.cdr.markForCheck();
      }
    });
  }

  printDocument(): void {
    window.print();
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

  toggleQuickUpload(type: 'certificate' | 'marksheet'): void {
    this.uploadType = type;
    this.showQuickUpload = !this.showQuickUpload;
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
        this.showQuickUpload = false;
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
        this.showQuickUpload = false;
        this.loadIssuedCertificates();
      },
      error: () => this.toastService.error('மதிப்பெண் சான்றிதழ் வழங்குவதில் பிழை.')
    });
  }
}
