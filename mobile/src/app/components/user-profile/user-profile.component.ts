import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit, OnChanges, OnDestroy {
  @Input() orders: any[] = [];
  @Input() initialOption: string | null = null;

  currentUser: User | null = null;
  isLoading: boolean = false;

  personDetails = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    tob: '',
    pob: '',
    rasi: '',
    star: '',
    gothram: '',
    profileImageUrl: ''
  };

  editForm = { ...this.personDetails };
  selectedOption: string | null = null;
  showEditModal: boolean = false;
  isSavedNotification: boolean = false;

  bookingsList: any[] = [];
  paymentsList: any[] = [];
  marriageMatches: any[] = [];
  isLoadingActivities: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translationService: TranslationService
  ) {}

  get currentLang(): LanguageCode {
    return this.translationService.currentLanguage();
  }

  setLanguage(lang: LanguageCode) {
    this.translationService.setLanguage(lang);
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }

  cleanTitle(title: string): string {
    if (!title) return 'ஜோதிட ஆலோசனை';
    return title.replace(/\(\(/g, '(').replace(/\)\)/g, ')').trim();
  }

  get token() {
    return this.authService.getToken() || '';
  }

  get headers() {
    return this.authService.getAuthHeaders();
  }

  ngOnInit() {
    if (this.initialOption) {
      this.selectedOption = this.initialOption;
      this.teleportModalToBody();
    }
    // Directly fetch live fresh data from Database
    this.loadProfileFromDb();
    this.loadActivitiesData();
  }

  ngOnDestroy() {
    this.removeModalFromBody();
  }

  private teleportModalToBody() {
    setTimeout(() => {
      const modalOverlays = document.querySelectorAll('.user-profile-wrapper .modal-overlay');
      modalOverlays.forEach((el) => {
        document.body.appendChild(el);
      });
    }, 0);
  }

  private removeModalFromBody() {
    const bodyModals = document.querySelectorAll('body > .modal-overlay');
    bodyModals.forEach((el) => {
      el.remove();
    });
  }

  loadActivitiesData() {
    if (!this.token) return;
    this.isLoadingActivities = true;
    this.cdr.detectChanges();
    const timestamp = Date.now();

    // 1. Load Bookings directly from database
    this.http.get<any>(`${environment.apiUrl}/user/bookings?_t=${timestamp}`, this.headers).subscribe({
      next: (res) => {
        if (res && res.bookings && Array.isArray(res.bookings)) {
          this.bookingsList = res.bookings.map((b: any) => {
            const details = typeof b.details === 'string' ? (this.safeJsonParse(b.details)) : (b.details || {});
            return {
              id: b.id,
              service: b.service_type || 'ஜோதிட ஆலோசனை',
              astrologer_name: details.astrologer_name || 'தலைமை வேத ஜோதிடர்',
              role_title: details.role_title || '',
              date: b.preferred_date || details.date || details.preferred_date || (b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB') : ''),
              slot: b.preferred_time || details.slot || details.time_slot || '10:00 AM - 11:00 AM',
              price: Number(b.price) || 0,
              status: b.status || 'Pending',
              chart_url: b.chart_url,
              parigaram: b.parigaram,
              parigaram_document: b.parigaram_document,
              razorpay_payment_id: details.razorpay_payment_id || b.razorpay_payment_id,
              razorpay_order_id: details.razorpay_order_id || b.razorpay_order_id,
              notes: details.notes || details.query || '',
              created_at: b.created_at
            };
          });
        } else {
          this.bookingsList = [];
        }
        this.isLoadingActivities = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingActivities = false;
        this.cdr.detectChanges();
      }
    });

    // 2. Load Payments directly from database
    this.http.get<any>(`${environment.apiUrl}/user/payments?_t=${timestamp}`, this.headers).subscribe({
      next: (res) => {
        if (res && res.payments && Array.isArray(res.payments)) {
          this.paymentsList = res.payments.map((p: any) => ({
            id: p.id,
            booking_id: p.booking_id,
            amount: Number(p.amount) || 0,
            currency: p.currency || 'INR',
            status: p.status || 'Paid',
            description: p.description || 'ஜோதிட ஆலோசனை முன்பதிவு',
            razorpay_payment_id: p.razorpay_payment_id,
            razorpay_order_id: p.razorpay_order_id,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
          }));
        } else {
          this.paymentsList = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });

    // 3. Load Marriage Matches directly from database
    this.http.get<any>(`${environment.apiUrl}/jathagam/my-matches?_t=${timestamp}`, this.headers).subscribe({
      next: (res) => {
        if (res && res.matches && Array.isArray(res.matches)) {
          this.marriageMatches = res.matches;
        } else {
          this.marriageMatches = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  private safeJsonParse(val: string): any {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialOption'] && this.initialOption) {
      this.selectedOption = this.initialOption;
    }
  }

  loadProfileFromDb() {
    if (!this.token) return;
    this.isLoading = true;
    this.cdr.detectChanges();
    const timestamp = Date.now();

    this.http.get<any>(`${environment.apiUrl}/user/profile?_t=${timestamp}`, this.headers).subscribe({
      next: (res) => {
        if (res) {
          this.personDetails.name = res.name || '';
          this.personDetails.email = res.email || '';
          this.personDetails.phone = res.phone || '';
          this.personDetails.profileImageUrl = res.avatar_url || '';

          const jd = res.jathagam_details;
          if (jd) {
            this.personDetails.dob = jd.dob || '';
            this.personDetails.tob = jd.tob || '';
            this.personDetails.pob = jd.pob || '';
            this.personDetails.rasi = jd.rasi || '';
            this.personDetails.star = jd.star || jd.nakshatra || '';
            this.personDetails.gothram = jd.gothram || '';
          }
          this.editForm = { ...this.personDetails };
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal() {
    this.editForm = { ...this.personDetails };
    this.showEditModal = true;
    this.teleportModalToBody();
  }

  isUploadingAvatar = false;

  onProfilePicSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingAvatar = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatars');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.editForm.profileImageUrl = res.url;
        }
        this.isUploadingAvatar = false;
      },
      error: () => {
        this.isUploadingAvatar = false;
      }
    });
  }

  saveProfile() {
    this.personDetails = { ...this.editForm };
    this.showEditModal = false;
    this.removeModalFromBody();
    this.isSavedNotification = true;

    const payload = {
      name: this.personDetails.name,
      phone: this.personDetails.phone,
      avatar_url: this.personDetails.profileImageUrl,
      jathagam_details: {
        dob: this.personDetails.dob,
        tob: this.personDetails.tob,
        pob: this.personDetails.pob,
        rasi: this.personDetails.rasi,
        star: this.personDetails.star,
        nakshatra: this.personDetails.star,
        gothram: this.personDetails.gothram
      }
    };

    this.http.put<any>(`${environment.apiUrl}/user/profile`, payload, this.headers).subscribe({
      next: () => {
        if (this.currentUser) {
          this.currentUser.fullName = this.personDetails.name;
          this.currentUser.mobileNumber = this.personDetails.phone;
          this.currentUser.profileImage = this.personDetails.profileImageUrl;
          sessionStorage.setItem('auth_user', JSON.stringify(this.currentUser));
          sessionStorage.setItem('astro_auth_user', JSON.stringify(this.currentUser));
        }
      },
      error: () => {}
    });

    setTimeout(() => {
      this.isSavedNotification = false;
    }, 3000);
  }

  openOptionDetail(optionKey: string) {
    this.selectedOption = optionKey;
    this.loadActivitiesData();
    this.teleportModalToBody();
  }

  closeOptionDetail() {
    this.selectedOption = null;
    this.showEditModal = false;
    this.removeModalFromBody();
    this.router.navigate([], {
      queryParams: { option: null },
      queryParamsHandling: 'merge'
    });
  }

  getPayments(): any[] {
    return this.paymentsList;
  }

  getServices(): any[] {
    return this.bookingsList;
  }

  getHoroscopes(): any[] {
    return this.bookingsList.filter(b => 
      b.service?.toLowerCase().includes('jathagam') || 
      b.service?.includes('ஜாதகம்') ||
      b.parigaram ||
      b.parigaram_document
    );
  }

  getMatches(): any[] {
    return this.marriageMatches;
  }

  getParsedDetails(order: any): any {
    if (order.parsedDetails) return order.parsedDetails;
    if (order.details) {
      if (typeof order.details === 'object') return order.details;
      if (typeof order.details === 'string') {
        const trimmed = order.details.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            return JSON.parse(trimmed);
          } catch {
            return { notes: order.details };
          }
        } else {
          return { notes: order.details };
        }
      }
    }
    return null;
  }

  logout() {
    this.authService.logout('astrology');
    this.router.navigate(['/welcome'], { replaceUrl: true });
  }
}
