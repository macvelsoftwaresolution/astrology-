import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Chapter, Book, Seminar } from '../../learn.page';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { RazorpayNativeService } from '../../../../services/razorpay-native.service';

declare var Razorpay: any;

@Component({
  selector: 'app-learn-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: false
})
export class LearnDashboardComponent implements OnInit, OnChanges {
  @Input() enrollForm: any;
  @Output() back = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() startQuiz = new EventEmitter<any>();
  @Output() viewCertificate = new EventEmitter<void>();

  @Input() dashboardTab: 'home' | 'lessons' | 'library' | 'profile' = 'home';
  @Output() dashboardTabChange = new EventEmitter<'home' | 'lessons' | 'library' | 'profile'>();

  @Input() currentLessonView: 'list' | 'detail' = 'list';
  @Output() currentLessonViewChange = new EventEmitter<'list' | 'detail'>();

  @Input() initialOption: string | null = null;
  @Input() orderNumber: string | null = null;

  isProcessingPayment = false;

  // Syllabus details (Dynamic from DB courses/modules/lessons)
  chapters: Chapter[] = [];

  // Selected lesson for details view / player
  selectedLesson: any = null;

  // Seminars List (Dynamic from DB)
  seminars: Seminar[] = [];

  // Book Library Store List (Dynamic from DB)
  books: Book[] = [];
  bookSearchQuery = '';
  bookFilterTab: 'all' | 'bought' = 'all';

  get filteredBooks(): Book[] {
    let result = this.books || [];
    if (this.bookFilterTab === 'bought') {
      result = result.filter(b => b.bought);
    }
    if (this.bookSearchQuery.trim()) {
      const q = this.bookSearchQuery.toLowerCase().trim();
      result = result.filter(b =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q))
      );
    }
    return result;
  }

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
  marqueeMessage = '';
  currentDisplayedNotifs: any[] = [];
  currentDisplayedLives: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public translationService: TranslationService,
    private razorpayService: RazorpayNativeService
  ) { }

  // 60-Day Curriculum State
  curriculumDays: any[] = [];
  activeBatch: any = null;
  curriculumMonthFilter: 'all' | 'm1' | 'm2' | 'm3' = 'all';
  selectedCurriculumDay: any = null;

  ngOnInit() {
    const savedLesson = sessionStorage.getItem('current_selected_lesson');
    if (savedLesson) {
      try {
        this.selectedLesson = JSON.parse(savedLesson);
      } catch { }
    }
    this.loadUserProfile();
    this.loadStudentCurriculum();
    this.loadCoursesAndSyllabus();
    this.loadMyBookOrders(); // Load orders first or concurrently
    this.loadSeminars();
    this.loadLiveClass();
    this.loadMaterials();
    this.loadExams();
    this.loadNotifications();
    this.checkInitialOption();
  }

  loadStudentCurriculum() {
    if (!this.authService.isLoggedIn('education')) return;
    this.http.get<any>(`${environment.apiUrl}/student/curriculum`, this.authService.getAuthHeaders('education')).subscribe({
      next: (res) => {
        if (res && res.curriculum) {
          this.curriculumDays = res.curriculum || [];
          this.activeBatch = res.active_batch || null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => { 
        this.showToast('Error loading curriculum: ' + err.message, 'danger');
      }
    });
  }

  get currentMonthTitle(): string {
    const completed = this.curriculumDays.filter(d => d.is_completed).length;
    if (completed < 20) return 'Month 1';
    if (completed < 40) return 'Month 2';
    return 'Month 3';
  }

  getFilteredStudentCurriculum(): any[] {
    const completed = this.curriculumDays.filter(d => d.is_completed).length;
    if (completed < 20) {
      return this.curriculumDays.filter(d => d.day_number >= 1 && d.day_number <= 20);
    } else if (completed < 40) {
      return this.curriculumDays.filter(d => d.day_number >= 21 && d.day_number <= 40);
    } else {
      return this.curriculumDays.filter(d => d.day_number >= 41 && d.day_number <= 60);
    }
  }

  openDayDetail(day: any) {
    this.selectedCurriculumDay = day;
    this.cdr.detectChanges();
  }

  closeDayDetail() {
    this.selectedCurriculumDay = null;
    this.cdr.detectChanges();
  }

  markDayCompleted(day: any) {
    if (!day || !day.id) return;
    const authHeaders = this.authService.getAuthHeaders('education').headers;
    this.http.post<any>(`${environment.apiUrl}/student/curriculum/${day.id}/complete`, {}, { headers: authHeaders }).subscribe({
      next: () => {
        day.is_completed = true;
        this.showToast(`நாள் ${day.day_number} பாடம் முடிந்தது என பதிவு செய்யப்பட்டது!`, 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        day.is_completed = true;
        this.showToast(`நாள் ${day.day_number} பாடம் முடிந்தது!`, 'success');
        this.cdr.detectChanges();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialOption'] || changes['orderNumber']) {
      this.checkInitialOption();
    }
  }

  checkInitialOption() {
    if (this.initialOption === 'orders') {
      if (this.orderNumber) {
        if (this.myBookOrders && this.myBookOrders.length > 0) {
          const order = this.myBookOrders.find((o: any) => o.order_number === this.orderNumber);
          if (order) {
            this.viewOrderStatus(order);
            return;
          }
        }
        if (this.isLoadingOrders) {
          return;
        }
      }
      this.showMyOrdersModal = true;
      this.showOrderStatusModal = false;
    }
  }

  get studentName(): string {
    const dbUser = this.authService.getCurrentUser();
    return this.enrollForm?.fullName || dbUser?.name || (dbUser as any)?.fullName || 'மாணவர்';
  }

  get studentProfilePic(): string {
    const user = this.authService.getCurrentUser();
    const savedPic = this.enrollForm?.profileImageUrl || localStorage.getItem('astro_student_avatar') || user?.avatar_url || (user as any)?.profileImageUrl || user?.profileImage;
    if (savedPic) return savedPic;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.studentName)}&background=4A0E17&color=ECC876&size=128`;
  }

  isUploadingPic = false;

  triggerProfilePicUpload() {
    const fileInput = document.getElementById('learnStudentPicInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onStudentPicSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Url = e.target.result;
      localStorage.setItem('astro_student_avatar', base64Url);
      if (!this.enrollForm) this.enrollForm = {};
      this.enrollForm.profileImageUrl = base64Url;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);

    // Upload to server if user is authenticated
    this.isUploadingPic = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatars');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          localStorage.setItem('astro_student_avatar', res.url);
          this.enrollForm.profileImageUrl = res.url;

          // Save photo URL directly into Database user profile
          if (this.authService.isLoggedIn()) {
            this.http.put<any>(`${environment.apiUrl}/user/profile`, { avatar_url: res.url }, this.authService.getAuthHeaders()).subscribe({
              next: () => {
                const currentUser = this.authService.getCurrentUser();
                if (currentUser) {
                  currentUser.avatar_url = res.url;
                  sessionStorage.setItem('astro_auth_user', JSON.stringify(currentUser));
                  sessionStorage.setItem('auth_user', JSON.stringify(currentUser));
                }
              }
            });
          }
        }
        this.isUploadingPic = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUploadingPic = false;
      }
    });
  }

  loadUserProfile() {
    if (this.authService.isLoggedIn('education') || this.authService.isLoggedIn()) {
      this.authService.getUserProfileFromDb().subscribe({
        next: (res: any) => {
          if (res) {
            const u = res.user || res.data || res;
            if (!this.enrollForm) this.enrollForm = {};
            this.enrollForm.fullName = u.name || u.fullName || u.student_name_tamil || u.student_name || '';
            this.enrollForm.mobileNumber = u.phone || u.mobileNumber || u.mobile || u.mobile_number || '';
            this.enrollForm.postalAddress = u.address || u.postalAddress || u.postal_address || '';
            this.enrollForm.studentId = u.student_id || '';
            this.enrollForm.avatarUrl = u.avatar_url || u.avatarUrl || '';
            this.cdr.detectChanges();
          }
        },
        error: () => { }
      });
    }
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
      error: () => { }
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
        const learnTypes = ['book_order', 'course', 'certificate', 'submission', 'live_class'];
        const allNotifs = res.notifications || [];
        this.notifications = allNotifs.filter((n: any) => learnTypes.includes(n.type));
        this.unreadCount = this.notifications.filter((n: any) => !n.is_read).length;
        this.updateMarqueeMessage();
      },
      error: () => {
        this.updateMarqueeMessage();
      }
    });
  }

  hideTicker = false;
  get hasActiveLiveClass(): boolean {
    return !!(this.currentDisplayedLives && this.currentDisplayedLives.length > 0);
  }

  private isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  }

  dismissTicker(e?: Event) {
    if (e) e.stopPropagation();
    if (this.currentDisplayedNotifs && this.currentDisplayedNotifs.length > 0) {
      this.currentDisplayedNotifs.forEach(n => {
        try {
          localStorage.setItem('ticker_notif_seen_' + n.id, 'true');
        } catch { }
        this.markNotificationAsRead(n);
      });
    }
    if (this.currentDisplayedLives && this.currentDisplayedLives.length > 0) {
      this.currentDisplayedLives.forEach(lc => {
        try {
          localStorage.setItem('ticker_live_dismissed_' + lc.id, 'true');
        } catch { }
      });
    }
    this.hideTicker = true;
    this.marqueeMessage = '';
    this.cdr.detectChanges();
  }

  onTickerClick() {
    if (this.currentDisplayedNotifs && this.currentDisplayedNotifs.length > 0) {
      this.currentDisplayedNotifs.forEach(n => {
        try {
          localStorage.setItem('ticker_notif_seen_' + n.id, 'true');
        } catch { }
        this.markNotificationAsRead(n);
      });
    }
    if (this.currentDisplayedLives && this.currentDisplayedLives.length > 0) {
      this.currentDisplayedLives.forEach(lc => {
        try {
          localStorage.setItem('ticker_live_dismissed_' + lc.id, 'true');
        } catch { }
      });
    }
    this.hideTicker = true;
    this.marqueeMessage = '';
    this.openNotificationsModal();
  }

  updateMarqueeMessage() {
    const parts: string[] = [];
    this.currentDisplayedNotifs = [];
    this.currentDisplayedLives = [];

    // 1. Live class announcements for today only (if not dismissed)
    if (this.liveClasses && this.liveClasses.length > 0) {
      const todayLives = this.liveClasses.filter((lc: any) => {
        if (!lc.is_active) return false;
        try {
          if (localStorage.getItem('ticker_live_dismissed_' + lc.id)) return false;
        } catch { }
        return lc.is_today || this.isToday(lc.created_at || lc.date);
      });

      if (todayLives.length > 0) {
        this.currentDisplayedLives = todayLives;
        const lc = todayLives[0];
        const dayPrefix = lc.is_today ? '🔴 இன்றைய நேரலை வகுப்பு' : `📅 நேரலை வகுப்பு (${lc.date_text || ''})`;
        parts.push(`${dayPrefix}: ${lc.title} • ${lc.time_text || ''} - ${lc.description || 'இப்போதே இணைந்திடுங்கள்'}`);
      }
    }

    // 2. Real unread notifications for THAT DAY (today) only (if not viewed/dismissed)
    if (this.notifications && this.notifications.length > 0) {
      const todayUnreadNotes = this.notifications.filter((n: any) => {
        if (n.is_read) return false;
        try {
          if (localStorage.getItem('ticker_notif_seen_' + n.id)) return false;
        } catch { }
        return this.isToday(n.created_at);
      });

      if (todayUnreadNotes.length > 0) {
        this.currentDisplayedNotifs = todayUnreadNotes;
        todayUnreadNotes.slice(0, 2).forEach((n: any) => {
          parts.push(`🔔 ${n.title}: ${n.body || n.message || ''}`);
        });
      }
    }

    // Only show ticker if there is a real notification/live class for today!
    this.marqueeMessage = parts.join('   ✦✦   ');
    if (!this.marqueeMessage) {
      this.hideTicker = true;
    } else {
      this.hideTicker = false;
    }
    this.cdr.detectChanges();
  }

  openNotificationsModal() {
    this.showNotificationsModal = false;
    this.router.navigate(['/notifications'], { queryParams: { from: 'learn' } });
  }

  closeNotificationsModal() {
    this.showNotificationsModal = false;
  }

  goToFullNotifications() {
    this.showNotificationsModal = false;
    this.router.navigate(['/notifications'], { queryParams: { from: 'learn' } });
  }

  markNotificationAsRead(n: any) {
    try {
      localStorage.setItem('ticker_notif_seen_' + n.id, 'true');
    } catch { }
    if (n.is_read || !this.authService.isLoggedIn()) {
      this.updateMarqueeMessage();
      return;
    }
    const authHeaders = this.authService.getAuthHeaders().headers;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, { headers: authHeaders }).subscribe({
      next: () => {
        n.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateMarqueeMessage();
      }
    });
  }

  markAllNotificationsRead() {
    if (this.notifications) {
      this.notifications.forEach((n: any) => {
        try {
          localStorage.setItem('ticker_notif_seen_' + n.id, 'true');
        } catch { }
        n.is_read = true;
      });
    }
    this.unreadCount = 0;
    this.updateMarqueeMessage();
    if (!this.authService.isLoggedIn()) return;
    const authHeaders = this.authService.getAuthHeaders().headers;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, { headers: authHeaders }).subscribe({
      next: () => { }
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
          this.checkInitialOption();
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
    if (this.books.length > 0) {
      this.books.forEach(b => {
        const order = this.myBookOrders.find(o =>
          o.book_title && b.title && o.book_title.trim().toLowerCase() === b.title.trim().toLowerCase()
        );
        if (order) {
          b.bought = true;
          b.order = order;
        } else {
          b.bought = false;
          b.order = null;
        }
      });
    }
  }

  openMyOrders() {
    this.showMyOrdersModal = true;
    this.showOrderStatusModal = false;
    // Orders already loaded on init, but we can refresh
    this.loadMyBookOrders();
  }

  closeMyOrders() {
    this.showMyOrdersModal = false;
    this.clearOrderQueryParams();
  }

  viewOrderStatus(order: any) {
    this.selectedOrderDetails = order;
    this.showOrderStatusModal = true;
    this.showMyOrdersModal = false;
  }

  closeOrderStatus() {
    this.showOrderStatusModal = false;
    this.selectedOrderDetails = null;
    this.clearOrderQueryParams();
  }

  private clearOrderQueryParams() {
    this.initialOption = null;
    this.orderNumber = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { option: null, order: null },
      queryParamsHandling: 'merge'
    });
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
      error: () => { }
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
      error: () => { }
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
      error: () => { }
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
      error: () => { }
    });
  }

  loadBooks() {
    this.http.get<any>(`${environment.apiUrl}/public/books`).subscribe({
      next: (res) => {
        if (res && res.books && Array.isArray(res.books)) {
          this.books = res.books.map((b: any) => {
            const price = Number(b.price) || 499;
            const rawOrig = b.original_price ? Number(b.original_price) : 0;
            const originalPrice = (rawOrig > price) ? rawOrig : (price + 200);
            return {
              id: String(b.id),
              title: b.title,
              author: b.author || 'ஆருத்ரா பதிப்பகம்',
              price: price,
              originalPrice: originalPrice,
              isBestseller: b.is_bestseller !== undefined ? Boolean(b.is_bestseller) : false,
              rating: b.rating ? Number(b.rating) : 5.0,
              formatLabel: b.format_label || '',
              coverImage: b.cover_image || 'assets/images/astro_service_bg.png',
              bought: false
            };
          });
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
    const user: any = this.authService.getCurrentUser('education') || this.authService.getCurrentUser('astrology') || this.authService.getCurrentUser();

    const name = this.enrollForm?.fullName ||
      this.enrollForm?.studentNameTamil ||
      user?.fullName ||
      user?.name ||
      user?.student_name || '';

    const phone = this.enrollForm?.mobileNumber ||
      this.enrollForm?.altMobileNumber ||
      this.enrollForm?.phone ||
      user?.mobileNumber ||
      user?.phone ||
      user?.mobile || '';

    const address = this.enrollForm?.postalAddress ||
      this.enrollForm?.address ||
      user?.postalAddress ||
      user?.address ||
      user?.postal_address || '';

    this.checkoutForm = {
      name: name,
      phone: phone,
      address: address
    };
  }

  async confirmCheckoutPayment() {
    if (!this.selectedCheckoutBook) return;

    if (!this.checkoutForm.name?.trim() || !this.checkoutForm.phone?.trim() || !this.checkoutForm.address?.trim()) {
      this.showToast(
        this.translationService.currentLanguage() === 'en'
          ? 'Please fill in all details (Name, Phone, Address).'
          : 'தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும் (பெயர், எண், முகவரி).',
        'warning'
      );
      return;
    }

    this.isProcessingPayment = true;
    const price = this.selectedCheckoutBook.price;
    const bookTitle = this.selectedCheckoutBook.title;
    const currentUser = this.authService.getCurrentUser('education') || this.authService.getCurrentUser('astrology') || this.authService.getCurrentUser();
    const token = this.authService.getToken();

    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Step 1: Create Razorpay Order via Backend
    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount: price }, { headers }).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && orderRes.key_id) {
          const options = {
            key: orderRes.key_id,
            amount: (orderRes.amount || price) * 100,
            currency: orderRes.currency || 'INR',
            name: 'ஆருத்ரா ஜோதிட சாஸ்திர வித்யாலயம்',
            description: `புத்தகம்: ${bookTitle}`,
            order_id: orderRes.order_id,
            prefill: {
              name: this.checkoutForm.name || currentUser?.name || 'பயனர்',
              contact: this.checkoutForm.phone || currentUser?.phone || '9876543210',
              email: currentUser?.email || 'user@astrology.com'
            },
            theme: {
              color: '#4A0E17'
            }
          };

          // Step 2: Launch Razorpay Popup
          this.razorpayService.open(options)
            .then((rzpRes) => {
              this.fulfillBookOrder(rzpRes.razorpay_payment_id, rzpRes.razorpay_order_id, rzpRes.razorpay_signature);
            })
            .catch((err) => {
              this.isProcessingPayment = false;
              const msg = err?.message || (typeof err === 'string' ? err : '');
              if (msg && !msg.toLowerCase().includes('dismissed') && !msg.toLowerCase().includes('cancelled')) {
                alert('கட்டணம் செலுத்துவதில் பிழை: ' + msg);
              }
            });
        } else {
          // Fallback if Razorpay credentials not configured
          this.fulfillBookOrder();
        }
      },
      error: (err) => {
        console.warn('Razorpay order creation fallback to direct order:', err);
        this.fulfillBookOrder();
      }
    });
  }

  fulfillBookOrder(paymentId?: string, orderId?: string, signature?: string) {
    if (!this.selectedCheckoutBook) {
      this.isProcessingPayment = false;
      return;
    }

    const orderPayload = {
      book_title: this.selectedCheckoutBook.title,
      price: this.selectedCheckoutBook.price,
      shipping_address: this.checkoutForm.address,
      phone: this.checkoutForm.phone,
      razorpay_payment_id: paymentId || null,
      razorpay_order_id: orderId || null,
      razorpay_signature: signature || null
    };

    const authHeaders = this.authService.getAuthHeaders('education').headers;
    this.http.post<any>(`${environment.apiUrl}/user/book-orders`, orderPayload, { headers: authHeaders }).subscribe({
      next: (res) => {
        this.isProcessingPayment = false;
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
        this.isProcessingPayment = false;
        console.error('Error placing book order:', err);
        this.showToast('ஆர்டர் செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', 'warning');
      }
    });
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
      this.showToast('இந்த வகுப்பிற்கான நேரலை இணைப்பு இன்னும் நிர்வாகியால் பகிரப்படவில்லை.', 'warning');
    }
  }



  playLiveClass(link: string) {
    if (link) {
      window.open(link, '_blank');
      this.showToast('நேரலை வகுப்பு திறக்கப்படுகிறது...', 'success');
    } else {
      this.showToast('நேரலை வகுப்பு இணைப்பு இன்னும் கிடைக்கவில்லை.', 'warning');
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
