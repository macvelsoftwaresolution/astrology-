import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-lms-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './lms-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './lms-tab.component.css']
})
export class LmsTabComponent implements OnInit {
  courses: any[] = [];
  seminars: any[] = [];
  materials: any[] = [];
  isLoading = false;

  // Search & Filter
  courseSearchQuery = '';
  selectedCourseLevelFilter = 'all';

  // Modals & Wizard State
  openCourseWizardModal = false;
  wizardStep = 1;
  newCourse = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner', thumbnail: '' };
  wizardModules: any[] = [];

  openSyllabusDrawerModal = false;
  selectedCourseForSyllabus: any = null;

  openModuleModal = false;
  selectedCourseIdForModule: number | null = null;
  newModuleTitle = '';

  openLessonModal = false;
  selectedModuleIdForLesson: number | null = null;
  newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };

  // Seminar & Material Modals
  openSeminarModal = false;
  editingSeminar: any = null;

  openMaterialModal = false;
  editingMaterial: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadCourses();
      this.loadSeminars();
      this.loadMaterials();
    }
  }

  loadCourses(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/courses', headers).subscribe({
      next: (res) => {
        this.courses = res.courses || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeminars(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/seminars', headers).subscribe({
      next: (res) => {
        this.seminars = res.seminars || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadMaterials(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/materials', headers).subscribe({
      next: (res) => {
        this.materials = res.materials || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  openNewSeminar(): void {
    this.editingSeminar = {
      id: null,
      title: '',
      speaker: '',
      date_text: 'இன்று',
      time_text: 'மாலை 06:00 - 07:30',
      status: 'upcoming',
      join_url: ''
    };
    this.openSeminarModal = true;
  }

  editSeminar(seminar: any): void {
    this.editingSeminar = { ...seminar };
    this.openSeminarModal = true;
  }

  saveSeminar(): void {
    if (!this.editingSeminar.title || !this.editingSeminar.speaker) {
      alert('Title and Speaker are required.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const url = this.editingSeminar.id
      ? `http://127.0.0.1:8000/api/admin/seminars/${this.editingSeminar.id}`
      : 'http://127.0.0.1:8000/api/admin/seminars';

    const req = this.editingSeminar.id
      ? this.http.put<any>(url, this.editingSeminar, headers)
      : this.http.post<any>(url, this.editingSeminar, headers);

    req.subscribe({
      next: () => {
        this.openSeminarModal = false;
        this.loadSeminars();
      },
      error: () => alert('Failed to save seminar.')
    });
  }

  deleteSeminar(id: number): void {
    if (!confirm('Are you sure you want to delete this seminar?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/seminars/${id}`, headers).subscribe({
      next: () => this.loadSeminars(),
      error: () => alert('Failed to delete seminar.')
    });
  }

  openNewMaterial(): void {
    this.editingMaterial = {
      id: null,
      course_id: 1,
      title: '',
      file_url: '',
      pages_text: '20 பக்கங்கள்'
    };
    this.openMaterialModal = true;
  }

  isUploadingThumbnail = false;
  isUploadingLessonFile = false;
  isUploadingMaterial = false;

  uploadCourseThumbnail(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingThumbnail = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'courses');

    this.http.post<any>('http://127.0.0.1:8000/api/upload', formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.newCourse.thumbnail = res.url;
        }
        this.isUploadingThumbnail = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Thumbnail upload failed.');
        this.isUploadingThumbnail = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadLessonFile(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingLessonFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lessons');

    this.http.post<any>('http://127.0.0.1:8000/api/upload', formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.newLesson.content_url = res.url;
        }
        this.isUploadingLessonFile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Lesson file upload failed.');
        this.isUploadingLessonFile = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadMaterialPdf(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingMaterial = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'notes');

    this.http.post<any>('http://127.0.0.1:8000/api/upload', formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingMaterial) {
          this.editingMaterial.file_url = res.url;
        }
        this.isUploadingMaterial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('PDF upload failed.');
        this.isUploadingMaterial = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveMaterial(): void {
    if (!this.editingMaterial.title) {
      alert('Material title is required.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const url = this.editingMaterial.id
      ? `http://127.0.0.1:8000/api/admin/materials/${this.editingMaterial.id}`
      : 'http://127.0.0.1:8000/api/admin/materials';

    const req = this.editingMaterial.id
      ? this.http.put<any>(url, this.editingMaterial, headers)
      : this.http.post<any>(url, this.editingMaterial, headers);

    req.subscribe({
      next: () => {
        this.openMaterialModal = false;
        this.loadMaterials();
      },
      error: () => alert('Failed to save study material.')
    });
  }

  deleteMaterial(id: number): void {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/materials/${id}`, headers).subscribe({
      next: () => this.loadMaterials(),
      error: () => alert('Failed to delete material.')
    });
  }

  getFilteredCourses(): any[] {
    let list = this.courses;
    if (this.selectedCourseLevelFilter !== 'all') {
      list = list.filter(c => c.level === this.selectedCourseLevelFilter);
    }
    if (this.courseSearchQuery && this.courseSearchQuery.trim()) {
      const q = this.courseSearchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getCourseModulesCount(course: any): number {
    return course.modules?.length || 0;
  }

  getCourseLessonsCount(course: any): number {
    if (!course.modules) return 0;
    return course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  }

  openNewCourseWizard(): void {
    this.wizardStep = 1;
    this.newCourse = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner', thumbnail: '' };
    this.wizardModules = [];
    this.openCourseWizardModal = true;
  }

  openSyllabusDrawer(course: any): void {
    this.selectedCourseForSyllabus = course;
    this.openSyllabusDrawerModal = true;
  }

  openAddModule(courseId: number): void {
    this.selectedCourseIdForModule = courseId;
    this.newModuleTitle = '';
    this.openModuleModal = true;
  }

  openAddLesson(moduleId: number): void {
    this.selectedModuleIdForLesson = moduleId;
    this.newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };
    this.openLessonModal = true;
  }

  submitModule(): void {
    if (!this.selectedCourseIdForModule || !this.newModuleTitle) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/courses/${this.selectedCourseIdForModule}/modules`, {
      title: this.newModuleTitle
    }, headers).subscribe({
      next: () => {
        alert('Module added successfully!');
        this.openModuleModal = false;
        this.loadCourses();
      },
      error: () => alert('Failed to add module.')
    });
  }

  submitLesson(): void {
    if (!this.selectedModuleIdForLesson || !this.newLesson.title || !this.newLesson.content_url) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/modules/${this.selectedModuleIdForLesson}/lessons`, this.newLesson, headers).subscribe({
      next: () => {
        alert('Lesson added successfully!');
        this.openLessonModal = false;
        this.loadCourses();
      },
      error: () => alert('Failed to add lesson.')
    });
  }

  addModuleInWizard(): void {
    if (!this.newModuleTitle.trim()) return;
    this.wizardModules.push({
      id: Date.now(),
      title: this.newModuleTitle.trim(),
      lessons: []
    });
    this.newModuleTitle = '';
  }

  publishWizardCourse(): void {
    const payload = {
      ...this.newCourse,
      modules: this.wizardModules
    };
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>('http://127.0.0.1:8000/api/admin/courses', payload, headers).subscribe({
      next: () => {
        alert('Course created and published live successfully!');
        this.openCourseWizardModal = false;
        this.loadCourses();
      },
      error: () => alert('Failed to publish course.')
    });
  }

  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/courses/${id}`, headers).subscribe({
      next: () => {
        alert('Course deleted successfully.');
        this.loadCourses();
      },
      error: () => alert('Failed to delete course.')
    });
  }
}
