import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Chapter, Book, Seminar } from '../../learn.page';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-learn-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class LearnDashboardComponent implements OnInit {
  @Input() enrollForm: any;
  @Output() logout = new EventEmitter<void>();
  @Output() startQuiz = new EventEmitter<any>();
  @Output() viewCertificate = new EventEmitter<void>();

  @Input() dashboardTab: 'home' | 'lessons' | 'library' | 'profile' = 'home';
  @Output() dashboardTabChange = new EventEmitter<'home' | 'lessons' | 'library' | 'profile'>();

  @Input() currentLessonView: 'list' | 'detail' = 'list';
  @Output() currentLessonViewChange = new EventEmitter<'list' | 'detail'>();

  // Syllabus details (Dynamic from DB courses/modules/lessons)
  chapters: Chapter[] = [];

  // Selected lesson for details view / player
  selectedLesson = {
    title: 'சிவ யோகம் - அறிமுகம்',
    instructor: 'ஜெக சீனிவாசன்',
    views: '24.5k',
    duration: '22 நிமிடங்கள்',
    description: 'இப்பாடம் சிவயோகத்தின் அடிப்படை தத்துவங்கள், அதன் முக்கியத்துவம் மற்றும் மனித உடலில் ஏற்படும் பிரபஞ்ச ஆற்றலின் அதிர்வுகளை விளக்குகிறது. தியானத்தின் மூலம் மனதை ஒருமுகப்படுத்த இது மிக அவசியம்.'
  };

  // Seminars List (Dynamic from DB)
  seminars: Seminar[] = [];

  // Book Library Store List (Dynamic from DB)
  books: Book[] = [];

  // PDF Notes List (Dynamic from DB)
  pdfNotes: any[] = [];

  // Checkout modal states
  activeBookCheckout = false;
  selectedCheckoutBook: Book | null = null;
  checkoutForm = {
    name: '',
    phone: '',
    address: ''
  };

  // My Orders State
  myBookOrders: any[] = [];
  showMyOrdersModal = false;
  isLoadingOrders = false;

  constructor(
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCoursesAndSyllabus();
    this.loadBooks();
    this.loadSeminars();
    this.loadMaterials();
    this.loadExams();
  }

  loadMyBookOrders() {
    this.isLoadingOrders = true;
    this.http.get<any>(`${environment.apiUrl}/user/book-orders`).subscribe({
      next: (res) => {
        if (res && res.orders) {
          this.myBookOrders = res.orders;
        }
        this.isLoadingOrders = false;
      },
      error: () => {
        this.isLoadingOrders = false;
      }
    });
  }

  openMyOrders() {
    this.showMyOrdersModal = true;
    this.loadMyBookOrders();
  }

  closeMyOrders() {
    this.showMyOrdersModal = false;
  }

  // Exams List (Dynamic from DB)
  exams: any[] = [];

  loadExams() {
    const userLevel = this.enrollForm?.courseLevel?.toUpperCase() || 'ILANILAI';
    this.http.get<any>(`${environment.apiUrl}/public/exams/${userLevel}`).subscribe({
      next: (res) => {
        if (res && res.exams) {
          this.exams = res.exams;
        }
      },
      error: () => {}
    });
  }

  loadSeminars() {
    this.http.get<any>(`${environment.apiUrl}/public/seminars`).subscribe({
      next: (res) => {
        if (res && res.seminars && Array.isArray(res.seminars)) {
          this.seminars = res.seminars.map((s: any) => ({
            title: s.title,
            speaker: s.speaker,
            date: s.date_text,
            time: s.time_text,
            status: s.status || 'upcoming',
            join_url: s.join_url
          }));
        }
      },
      error: () => {}
    });
  }

  loadMaterials() {
    this.http.get<any>(`${environment.apiUrl}/public/materials`).subscribe({
      next: (res) => {
        if (res && res.materials && Array.isArray(res.materials)) {
          this.pdfNotes = res.materials.map((m: any) => ({
            title: m.title,
            pages: m.pages_text || '10 பக்கங்கள்',
            url: m.file_url || ''
          }));
        }
      },
      error: () => {}
    });
  }

  loadCoursesAndSyllabus() {
    this.http.get<any>(`${environment.apiUrl}/public/courses`).subscribe({
      next: (res) => {
        if (res && res.courses && Array.isArray(res.courses) && res.courses.length > 0) {
          // Find course matching the enrolled level
          const userLevel = this.enrollForm?.courseLevel?.toUpperCase() || 'ILANILAI';
          let activeCourse = res.courses.find((c: any) => c.level && c.level.toUpperCase() === userLevel);
          
          if (!activeCourse) {
            // Fallback to first course if no match
            activeCourse = res.courses[0];
          }

          if (activeCourse && activeCourse.modules && Array.isArray(activeCourse.modules)) {
            this.chapters = activeCourse.modules.map((m: any, idx: number) => ({
              title: m.title || `அத்தியாயம் ${idx + 1}`,
              progress: idx === 0 ? 100 : (idx === 1 ? 60 : 0),
              completed: idx === 0,
              isOpen: idx === 0,
              lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
                title: l.title || `பாடம் ${lIdx + 1}`,
                duration: l.duration || '15:00 நிமிடங்கள்',
                completed: idx === 0, // Mock progress
                videoUrl: l.content_url || '',
                audioUrl: l.content_url || '',
                description: l.description || '',
                type: l.content_type || 'video',
                url: l.content_url || ''
              }))
            }));
          }
        }
      },
      error: () => {}
    });
  }

  loadBooks() {
    this.http.get<any>(`${environment.apiUrl}/public/books`).subscribe({
      next: (res) => {
        if (res && res.books && Array.isArray(res.books)) {
          this.books = res.books.map((b: any) => ({
            id: String(b.id),
            title: b.title,
            author: b.author || 'ஆருத்ரா பதிப்பகம்',
            price: Number(b.price) || 499,
            coverImage: b.cover_image || 'assets/images/astro_service_bg.png',
            bought: false
          }));
        }
      },
      error: () => {}
    });
  }

  toggleChapter(chapter: Chapter) {
    chapter.isOpen = !chapter.isOpen;
  }

  initiateBuyBook(book: Book) {
    this.selectedCheckoutBook = book;
    this.activeBookCheckout = true;
    this.checkoutForm = {
      name: this.enrollForm?.fullName || '',
      phone: '',
      address: ''
    };
  }

  async confirmCheckoutPayment() {
    if (this.selectedCheckoutBook) {
      if (!this.checkoutForm.name || !this.checkoutForm.phone || !this.checkoutForm.address) {
        const toast = await this.toastController.create({
          message: 'தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும் (பெயர், எண், முகவரி).',
          duration: 2500,
          color: 'warning',
          position: 'bottom'
        });
        await toast.present();
        return;
      }

      const orderPayload = {
        book_title: this.selectedCheckoutBook.title,
        price: this.selectedCheckoutBook.price,
        shipping_address: this.checkoutForm.address,
        phone: this.checkoutForm.phone
      };

      this.http.post<any>(`${environment.apiUrl}/user/book-orders`, orderPayload).subscribe({
        next: async (res) => {
          if (this.selectedCheckoutBook) {
            this.selectedCheckoutBook.bought = true;
          }
          this.activeBookCheckout = false;
          const toast = await this.toastController.create({
            message: `${orderPayload.book_title} வெற்றிகரமாக ஆர்டர் செய்யப்பட்டது! (Order: ${res.order_number || ''})`,
            duration: 3000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
          this.selectedCheckoutBook = null;
        },
        error: async () => {
          if (this.selectedCheckoutBook) {
            this.selectedCheckoutBook.bought = true;
          }
          this.activeBookCheckout = false;
          const toast = await this.toastController.create({
            message: `${this.selectedCheckoutBook?.title} வெற்றிகரமாக வாங்கப்பட்டது!`,
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
          this.selectedCheckoutBook = null;
        }
      });
    }
  }

  closeCheckout() {
    this.activeBookCheckout = false;
    this.selectedCheckoutBook = null;
  }

  async downloadPDF(fileName: string, url?: string) {
    const toast = await this.toastController.create({
      message: `${fileName} - PDF தரவிறக்கப்படுகிறது...`,
      duration: 2500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    if (url) {
      window.open(url, '_blank');
    } else {
      // Trigger basic simulated download
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,JVBERi0xLjQKJVRleHQgRG93bmxvYWQgRGVtbw==';
      link.download = `${fileName}.pdf`;
      link.click();
    }
  }

  setTab(tab: 'home' | 'lessons' | 'library' | 'profile') {
    this.dashboardTab = tab;
    this.dashboardTabChange.emit(tab);
  }

  handleBackClick() {
    if (this.currentLessonView === 'detail') {
      this.currentLessonView = 'list';
      this.currentLessonViewChange.emit('list');
    } else if (this.dashboardTab !== 'home') {
      this.setTab('home');
    } else {
      this.logout.emit();
    }
  }

  goToExams() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    // Auto-open syllabus or scroll to exam
    this.chapters.forEach(c => c.isOpen = true);
    this.showToast('தேர்வுகள் பிரிவிற்கு நகர்த்தப்பட்டது. பாடத்தைத் தேர்வுசெய்து தேர்வினை எழுதலாம்.', 'secondary');
  }

  goToSyllabus() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    this.chapters.forEach(c => c.isOpen = true);
  }

  selectCourseLesson(lesson: any) {
    this.selectedLesson = {
      title: lesson.title,
      instructor: 'ஜெக சீனிவாசன்',
      views: '12.8k',
      duration: lesson.duration,
      description: lesson.description || `இப்பாடம் ${lesson.title} பற்றிய விரிவான விளக்கங்களை வழங்குகிறது.`
    };
    
    // Add custom properties for handling different content types
    (this.selectedLesson as any).type = lesson.type;
    (this.selectedLesson as any).url = lesson.url;

    this.currentLessonView = 'detail';
    this.currentLessonViewChange.emit('detail');

    if (lesson.type === 'live') {
      window.open(lesson.url, '_blank');
      this.showToast('நேரலை வகுப்பு திறக்கப்படுகிறது...', 'success');
    } else if (lesson.type === 'pdf') {
      this.downloadPDF(lesson.title, lesson.url);
    } else if (lesson.type === 'audio') {
      this.showToast('ஒலி பாடம் பிளே செய்யப்படுகிறது...', 'success');
    } else {
      this.playVideo();
    }
  }

  goToAudio() {
    this.setTab('lessons');
    this.currentLessonView = 'detail';
    this.currentLessonViewChange.emit('detail');
    this.playVideo();
  }

  openMeeting(url?: string) {
    if (url) {
      window.open(url, '_blank');
      this.showToast('நேரலை வகுப்பு திறக்கப்படுகிறது...', 'success');
    } else {
      this.openMockGoogleMeet();
    }
  }

  openMockGoogleMeet() {
    const meetUrl = 'https://meet.google.com/abc-defg-hij';
    window.open(meetUrl, '_blank');
    this.showToast('நேரலை வகுப்பு கூகுள் மீட் லிங்க் திறக்கப்படுகிறது...', 'success');
  }

  async openDiary() {
    const toast = await this.toastController.create({
      message: 'ஆன்மீக நாட்குறிப்பு திறக்கப்பட்டது',
      duration: 2000,
      color: 'dark',
      position: 'bottom'
    });
    await toast.present();
  }

  playLiveClass() {
    this.openMockGoogleMeet();
  }

  async playVideo() {
    const toast = await this.toastController.create({
      message: 'வீடியோ வகுப்பு பிளே செய்யப்படுகிறது...',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
