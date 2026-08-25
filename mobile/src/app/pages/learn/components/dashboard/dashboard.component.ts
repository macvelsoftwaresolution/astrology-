import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chapter, Book, Seminar } from '../../learn.page';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-learn-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class LearnDashboardComponent implements OnInit {
  @Input() enrollForm: any;
  @Output() back = new EventEmitter<void>();
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
  selectedLesson: any = null;

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
  
  // Specific Order Status Modal State
  selectedOrderDetails: any = null;
  showOrderStatusModal = false;

  // Notifications & Announcements State
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotificationsModal = false;
  marqueeMessage = '📢 ஆருத்ரா ஜோதிட பயிலரங்கத்திற்கு தங்களை அன்புடன் வரவேற்கிறோம்! ✦ புதிய நேரலை வகுப்புகள் மற்றும் பாடக்குறிப்புகள் உடனுக்குடன் புதுப்பிக்கப்படுகின்றன ✦ பாடங்களை முழுமையாக படித்து தேர்வு எழுதி சான்றிதழ் பெறுங்கள்!';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const savedLesson = sessionStorage.getItem('current_selected_lesson');
    if (savedLesson) {
      try {
        this.selectedLesson = JSON.parse(savedLesson);
      } catch {}
    }
    this.loadCoursesAndSyllabus();
    this.loadMyBookOrders(); // Load orders first or concurrently
    this.loadSeminars();
    this.loadLiveClass();
    this.loadMaterials();
    this.loadExams();
    this.loadNotifications();
  }

  liveClasses: any[] = [];

  loadLiveClass() {
    const userLevel = this.enrollForm?.courseLevel?.toUpperCase() || 'ILANILAI';
    this.http.get<any>(`${environment.apiUrl}/public/live-class/${userLevel}`).subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.liveClasses = res.data.filter((lc: any) => lc.is_active);
          this.updateMarqueeMessage();
        }
      },
      error: () => {}
    });
  }

  loadNotifications() {
    if (!this.authService.isLoggedIn()) {
      this.updateMarqueeMessage();
      return;
    }
    const authHeaders = this.authService.getAuthHeaders().headers;
    this.http.get<any>(`${environment.apiUrl}/user/notifications`, { headers: authHeaders }).subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.unreadCount = res.unread_count || 0;
        this.updateMarqueeMessage();
      },
      error: () => {
        this.updateMarqueeMessage();
      }
    });
  }

  hideTicker = false;
  get hasActiveLiveClass(): boolean {
    return !!(this.liveClasses && this.liveClasses.length > 0);
  }

  dismissTicker(e?: Event) {
    if (e) e.stopPropagation();
    this.hideTicker = true;
  }

  updateMarqueeMessage() {
    const parts: string[] = [];

    // 1. Live class announcements
    if (this.liveClasses && this.liveClasses.length > 0) {
      const lc = this.liveClasses[0];
      const dayPrefix = lc.is_today ? '🔴 இன்றைய நேரலை வகுப்பு' : `📅 நேரலை வகுப்பு (${lc.date_text || ''})`;
      parts.push(`${dayPrefix}: ${lc.title} • ${lc.time_text || ''} - ${lc.description || 'இப்போதே இணைந்திடுங்கள்'}`);
    }

    // 2. Meaningful real notifications (skip dummy/test words if any)
    if (this.notifications && this.notifications.length > 0) {
      const validNotes = this.notifications
        .filter((n: any) => n.title && n.title.toLowerCase() !== 'hello' && n.title.toLowerCase() !== 'test')
        .slice(0, 2);
      validNotes.forEach((n: any) => {
        parts.push(`🔔 ${n.title}: ${n.body || n.message || ''}`);
      });
    }

    // 3. Educational / LMS reminders only if no active announcements
    if (parts.length === 0) {
      parts.push('📢 ஆருத்ரா ஜோதிட பயிலரங்கம்: அனைத்து பாடங்களையும் முழுமையாக கற்று தேர்வு எழுதி சான்றிதழ் பெற்றிடுங்கள்!');
      parts.push('✨ உங்கள் சந்தேகங்களை நேரலை வகுப்புகளில் ஆசிரியரிடம் நேரடியாக கேட்டுத் தெரிந்து கொள்ளலாம்.');
    }

    this.marqueeMessage = parts.join('   ✦✦   ');
  }

  openNotificationsModal() {
    this.showNotificationsModal = true;
    this.loadNotifications();
  }

  closeNotificationsModal() {
    this.showNotificationsModal = false;
  }

  goToFullNotifications() {
    this.showNotificationsModal = false;
    this.router.navigate(['/notifications']);
  }

  markNotificationAsRead(n: any) {
    if (n.is_read || !this.authService.isLoggedIn()) return;
    const authHeaders = this.authService.getAuthHeaders().headers;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, { headers: authHeaders }).subscribe({
      next: () => {
        n.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllNotificationsRead() {
    if (!this.authService.isLoggedIn()) return;
    const authHeaders = this.authService.getAuthHeaders().headers;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, { headers: authHeaders }).subscribe({
      next: () => {
        this.notifications.forEach((n: any) => n.is_read = true);
        this.unreadCount = 0;
      }
    });
  }

  loadMyBookOrders() {
    if (!this.authService.isLoggedIn('education') && !this.authService.isLoggedIn()) {
      this.loadBooks();
      return;
    }
    this.isLoadingOrders = true;
    const authHeaders = this.authService.getAuthHeaders('education').headers;
    this.http.get<any>(`${environment.apiUrl}/user/book-orders`, { headers: authHeaders }).subscribe({
      next: (res) => {
        if (res && res.orders) {
          this.myBookOrders = res.orders;
          this.syncBooksWithOrders();
        }
        this.isLoadingOrders = false;
        // Now load books if not loaded, or sync if already loaded
        this.loadBooks();
      },
      error: () => {
        this.isLoadingOrders = false;
        this.loadBooks(); // Still load books even if orders fail
      }
    });
  }

  syncBooksWithOrders() {
    if (this.books.length > 0 && this.myBookOrders.length > 0) {
      this.books.forEach(b => {
        const order = this.myBookOrders.find(o => 
          o.book_title && b.title && o.book_title.trim().toLowerCase() === b.title.trim().toLowerCase()
        );
        if (order) {
          b.bought = true;
          b.order = order;
        }
      });
    }
  }

  openMyOrders() {
    this.showMyOrdersModal = true;
    // Orders already loaded on init, but we can refresh
    this.loadMyBookOrders();
  }

  closeMyOrders() {
    this.showMyOrdersModal = false;
  }

  viewOrderStatus(order: any) {
    this.selectedOrderDetails = order;
    this.showOrderStatusModal = true;
  }

  closeOrderStatus() {
    this.showOrderStatusModal = false;
    this.selectedOrderDetails = null;
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
    const userLevel = this.enrollForm?.courseLevel?.toUpperCase() || 'ILANILAI';
    this.http.get<any>(`${environment.apiUrl}/public/seminars/${userLevel}`).subscribe({
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
    const userLevel = this.enrollForm?.courseLevel?.toUpperCase() || 'ILANILAI';
    this.http.get<any>(`${environment.apiUrl}/public/materials/${userLevel}`).subscribe({
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
            // No course found for the selected level. Do not fallback to another level's course.
            this.chapters = [];
          } else if (activeCourse && activeCourse.modules && Array.isArray(activeCourse.modules)) {
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
          this.syncBooksWithOrders();
        }
      },
      error: (err) => console.error('Error loading books:', err)
    });
  }

  toggleChapter(chapter: Chapter) {
    chapter.isOpen = !chapter.isOpen;
  }

  initiateBuyBook(book: Book) {
    this.selectedCheckoutBook = book;
    this.activeBookCheckout = true;
    const user = this.authService.getCurrentUser('education') || this.authService.getCurrentUser('astrology') || this.authService.getCurrentUser();
    this.checkoutForm = {
      name: this.enrollForm?.fullName || user?.name || user?.fullName || '',
      phone: this.enrollForm?.phone || user?.phone || user?.mobileNumber || '',
      address: this.enrollForm?.address || ''
    };
  }

  async confirmCheckoutPayment() {
    if (this.selectedCheckoutBook) {
      if (!this.checkoutForm.name?.trim() || !this.checkoutForm.phone?.trim() || !this.checkoutForm.address?.trim()) {
        this.showToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும் (பெயர், எண், முகவரி).', 'warning');
        return;
      }

      const orderPayload = {
        book_title: this.selectedCheckoutBook.title,
        price: this.selectedCheckoutBook.price,
        shipping_address: this.checkoutForm.address,
        phone: this.checkoutForm.phone
      };

      const authHeaders = this.authService.getAuthHeaders('education').headers;
      this.http.post<any>(`${environment.apiUrl}/user/book-orders`, orderPayload, { headers: authHeaders }).subscribe({
        next: (res) => {
          if (this.selectedCheckoutBook) {
            this.selectedCheckoutBook.bought = true;
            this.selectedCheckoutBook.order = res.order || {
              book_title: orderPayload.book_title,
              order_number: res.order_number,
              status: 'Processing',
              created_at: new Date().toISOString()
            };
          }
          this.activeBookCheckout = false;
          this.loadMyBookOrders();
          this.showToast(`${orderPayload.book_title} வெற்றிகரமாக ஆர்டர் செய்யப்பட்டது! (Order: ${res.order_number || ''})`, 'success');
          this.selectedCheckoutBook = null;
        },
        error: (err) => {
          console.error('Error placing book order:', err);
          this.showToast('ஆர்டர் செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', 'warning');
        }
      });
    }
  }

  closeCheckout() {
    this.activeBookCheckout = false;
    this.selectedCheckoutBook = null;
  }

  downloadPDF(fileName: string, url?: string) {
    this.showToast(`${fileName} - PDF தரவிறக்கப்படுகிறது...`, 'success');

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

  handleBackClick(): boolean {
    if (this.showOrderStatusModal) {
      this.showOrderStatusModal = false;
      return true;
    }
    if (this.showMyOrdersModal) {
      this.showMyOrdersModal = false;
      return true;
    }
    if (this.activeBookCheckout) {
      this.activeBookCheckout = false;
      return true;
    }
    if (this.showNotificationsModal) {
      this.showNotificationsModal = false;
      return true;
    }
    if (this.currentLessonView === 'detail') {
      this.currentLessonView = 'list';
      this.currentLessonViewChange.emit('list');
      sessionStorage.removeItem('current_selected_lesson');
      return true;
    }
    if (this.dashboardTab !== 'home') {
      this.setTab('home');
      return true;
    }
    this.back.emit();
    return false;
  }

  goToExams() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    sessionStorage.removeItem('current_selected_lesson');
    // Auto-open syllabus or scroll to exam
    this.chapters.forEach(c => c.isOpen = true);
    this.showToast('தேர்வுகள் பிரிவிற்கு நகர்த்தப்பட்டது. பாடத்தைத் தேர்வுசெய்து தேர்வினை எழுதலாம்.', 'secondary');
  }

  goToSyllabus() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    sessionStorage.removeItem('current_selected_lesson');
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

    sessionStorage.setItem('current_selected_lesson', JSON.stringify(this.selectedLesson));

    this.currentLessonView = 'detail';
    this.currentLessonViewChange.emit('detail');

    if (lesson.type === 'live') {
      window.open(lesson.url, '_blank');
      this.showToast('நேரலை வகுப்பு திறக்கப்படுகிறது...', 'success');
    } else if (lesson.type === 'pdf') {
      this.downloadPDF(lesson.title, lesson.url);
    } else if (lesson.type === 'audio') {
      this.showToast('ஒலி பாடம் பிளே செய்யப்படுகிறது...', 'success');
    } else if (lesson.type === 'text' || lesson.type === 'document') {
      this.showToast('உரை திறக்கப்படுகிறது...', 'success');
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

  activeToast: { message: string, icon: string, type: string, isClosing?: boolean } | null = null;
  private toastTimer: any = null;

  openMeeting(url?: string, status?: string, seminar?: any) {
    if (status === 'past') {
      this.showToast('இந்தக் கருத்தரங்க நேரம் முடிந்துவிட்டது.', 'warning');
      return;
    }
    if (status === 'upcoming' || (!status && !url)) {
      const timeInfo = seminar ? `${seminar.date_text || seminar.date || ''} ${seminar.time_text || seminar.time || ''}`.trim() : '';
      const msg = timeInfo ? `இந்தக் கருத்தரங்கம் (${timeInfo}) தொடங்கும்.` : 'இந்தக் கருத்தரங்கம் குறிப்பிட்ட நேரத்தில் தொடங்கும்.';
      this.showToast(msg, 'info');
      return;
    }
    if (url) {
      window.open(url, '_blank');
      this.showToast('நேரலை வகுப்பில் இணைகிறது...', 'success');
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
    this.showToast('ஆன்மீக நாட்குறிப்பு திறக்கப்பட்டது', 'info');
  }

  playLiveClass(link: string) {
    if (link) {
      window.open(link, '_blank');
      this.showToast('நேரலை வகுப்பு திறக்கப்படுகிறது...', 'success');
    } else {
      this.openMockGoogleMeet();
    }
  }

  async playVideo() {
    this.showToast('வீடியோ வகுப்பு பிளே செய்யப்படுகிறது...', 'success');
  }

  showToast(message: string, type: 'info' | 'success' | 'warning' | 'secondary' | string = 'info') {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    let icon = 'bi bi-info-circle-fill';
    if (type === 'success') icon = 'bi bi-check-circle-fill';
    if (type === 'warning') icon = 'bi bi-clock-history';
    if (message.includes('தொடங்கும்') || message.includes('நேரம்')) icon = 'bi bi-calendar-event-fill';

    // Clean any leading emoji
    const cleanMsg = message.replace(/^[📢⏳✅✨🔔]\s*/, '');

    this.activeToast = {
      message: cleanMsg,
      icon,
      type,
      isClosing: false
    };
    this.cdr.detectChanges();

    this.toastTimer = setTimeout(() => {
      this.dismissToast();
    }, 3500);
  }

  dismissToast() {
    if (!this.activeToast) return;
    this.activeToast.isClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.activeToast = null;
      this.cdr.detectChanges();
    }, 280);
  }
}
