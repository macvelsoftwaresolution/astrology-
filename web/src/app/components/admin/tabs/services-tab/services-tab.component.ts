import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-services-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './services-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './services-tab.component.css']
})
export class ServicesTabComponent implements OnInit {
  defaultAstrologers: any[] = [
    {
      id: 1,
      name: 'குரு ஸ்ரீநிவாசன்',
      role_title: 'தலைமை வேத ஜோதிடர்',
      experience: '25+ ஆண்டுகள்',
      specialty: 'ஜாதகக் கணிப்பு, திருமணப் பொருத்தம்',
      fee: 999,
      phone: '9840123456',
      bio: 'வேத ஜோதிடக் கலை பாரம்பரிய குடும்பத்தைச் சேர்ந்தவர்.',
      avatar_icon: 'bi bi-person-fill',
      available_slots: ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '03:30 PM - 04:30 PM', '05:00 PM - 06:00 PM', '06:30 PM - 07:30 PM'],
      blocked_dates: ['2026-08-23', '2026-08-30'],
      status: 'Available',
      rating: 4.98,
      consultation_count: 2450
    },
    {
      id: 2,
      name: 'குரு ராமஜெயம்',
      role_title: 'பிரசன்ன & வாஸ்து நிபுணர்',
      experience: '18+ ஆண்டுகள்',
      specialty: 'கேள்வி ஜோதிடம், வாஸ்து பரிகாரம்',
      fee: 799,
      phone: '9840654321',
      bio: 'பிரசன்ன ஜோதிடம் மற்றும் வாஸ்து சாஸ்திர நிபுணர்.',
      avatar_icon: 'bi bi-person-bounding-box',
      available_slots: ['10:30 AM - 11:30 AM', '02:00 PM - 03:00 PM', '04:30 PM - 05:30 PM', '07:00 PM - 08:00 PM'],
      blocked_dates: ['2026-08-23'],
      status: 'Available',
      rating: 4.92,
      consultation_count: 1820
    },
    {
      id: 3,
      name: 'குரு மீனாட்சி சுந்தரம்',
      role_title: 'நாடி & எண்கணித நிபுணர்',
      experience: '15+ ஆண்டுகள்',
      specialty: 'நாடி ஜோதிடம், அதிர்ஷ்டப் பெயர்',
      fee: 599,
      phone: '9840789012',
      bio: 'நாடி சுவடி மற்றும் எண்கணிதத்தில் தேர்ச்சி பெற்றவர்.',
      avatar_icon: 'bi bi-person-badge',
      available_slots: ['09:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '03:00 PM - 04:00 PM', '06:00 PM - 07:00 PM'],
      blocked_dates: ['2026-08-24'],
      status: 'Available',
      rating: 4.90,
      consultation_count: 1240
    }
  ];

  quickSlotsList: string[] = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '12:00 PM - 01:00 PM',
    '02:30 PM - 03:30 PM',
    '04:00 PM - 05:00 PM',
    '05:30 PM - 06:30 PM',
    '07:00 PM - 08:00 PM'
  ];

  presetAvatarIcons: string[] = [
    'bi bi-person-fill',
    'bi bi-person-bounding-box',
    'bi bi-person-badge',
    'bi bi-person-check-fill',
    'bi bi-person-vcard-fill',
    'bi bi-stars'
  ];

  activeView: 'bookings' | 'astrologers' = 'bookings';
  astrologersList: any[] = [...this.defaultAstrologers];
  selectedAstrologerForManage: any = null;
  isCreatingNewAstrologer = false;
  astrologerManageTab: 'profile' | 'slots' | 'calendar' = 'profile';
  newSlotInput = '';
  astrologerCalendarDays: any[] = [];
  astrologerCalendarDate: Date = new Date();
  astrologerSaving = false;
  astrologerSuccessMsg = '';

  serviceBookings: any[] = [];
  bookingFilterStatus = 'all';
  bookingSearchQuery = '';

  selectedBookingForView: any = null;
  selectedBookingForFulfill: any = null;
  fulfillForm = { status: 'Completed', chart_url: '' };

  manualBookingModalOpen = false;
  manualBookingForm = {
    user_name: '',
    user_phone: '',
    service_type: 'Full Jathagam Reading & Porutham Matching',
    price: 499,
    booking_date: '',
    dob: '',
    tob: '',
    pob: '',
    query: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadAllServicesData();
    }
  }

  loadAllServicesData(): void {
    this.loadAstrologers();
    this.loadBookings();
  }

  loadAstrologers(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/astrologers', headers).subscribe({
      next: (res) => {
        if (res.astrologers && res.astrologers.length > 0) {
          this.astrologersList = res.astrologers;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadBookings(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/bookings', headers).subscribe({
      next: (res) => {
        this.serviceBookings = res || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openNewAstrologerModal(): void {
    this.isCreatingNewAstrologer = true;
    this.selectedAstrologerForManage = {
      id: null,
      name: '',
      role_title: 'வேத ஜோதிடர்',
      experience: '10+ ஆண்டுகள்',
      specialty: 'துல்லிய ஜாதகக் கணிப்பு, திருமணப் பொருத்தம்',
      fee: 499,
      phone: '',
      bio: '',
      avatar_icon: 'bi bi-person-fill',
      avatar_url: null,
      available_slots: [
        '10:00 AM - 11:00 AM',
        '11:30 AM - 12:30 PM',
        '03:30 PM - 04:30 PM',
        '05:00 PM - 06:00 PM',
        '06:30 PM - 07:30 PM'
      ],
      blocked_dates: [],
      status: 'Available',
      rating: 4.90,
      consultation_count: 0
    };
    this.astrologerManageTab = 'profile';
    this.astrologerCalendarDate = new Date();
    this.newSlotInput = '';
    this.astrologerSuccessMsg = '';
    this.generateAstrologerMonthCalendar();
  }

  openAstrologerManageModal(astro: any): void {
    this.isCreatingNewAstrologer = false;
    this.selectedAstrologerForManage = {
      ...astro,
      available_slots: Array.isArray(astro.available_slots) ? [...astro.available_slots] : [],
      blocked_dates: Array.isArray(astro.blocked_dates) ? [...astro.blocked_dates] : []
    };
    this.astrologerManageTab = 'profile';
    this.astrologerCalendarDate = new Date();
    this.newSlotInput = '';
    this.astrologerSuccessMsg = '';
    this.generateAstrologerMonthCalendar();
  }

  deleteAstrologer(astro: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const name = astro.name || 'இந்த ஜோதிடரை';
    if (!confirm(`"${name}" - இந்த ஜோதிடரை நிச்சயமாக நீக்க வேண்டுமா?`)) {
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/astrologers/${astro.id}`, headers).subscribe({
      next: () => {
        this.astrologersList = this.astrologersList.filter(a => a.id !== astro.id);
        if (this.selectedAstrologerForManage?.id === astro.id) {
          this.selectedAstrologerForManage = null;
        }
        this.loadAstrologers();
        this.cdr.detectChanges();
      },
      error: () => alert('❌ ஜோதிடரை நீக்குவதில் பிழை ஏற்பட்டது.')
    });
  }

  generateAstrologerMonthCalendar(): void {
    if (!this.selectedAstrologerForManage) return;
    const year = this.astrologerCalendarDate.getFullYear();
    const month = this.astrologerCalendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const tamilDays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
    const todayStr = this.formatDateKey(new Date());
    const blockedList = this.selectedAstrologerForManage.blocked_dates || [];

    const days: any[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = this.formatDateKey(prevDate);
      days.push({
        date: dateStr,
        dayNumber: prevDate.getDate(),
        dayNameTamil: tamilDays[prevDate.getDay()],
        dayOfWeek: prevDate.getDay(),
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isBlocked: blockedList.includes(dateStr)
      });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = this.formatDateKey(curDate);
      const isBlocked = blockedList.includes(dateStr);
      days.push({
        date: dateStr,
        dayNumber: d,
        dayNameTamil: tamilDays[curDate.getDay()],
        dayOfWeek: curDate.getDay(),
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isBlocked: isBlocked
      });
    }

    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = this.formatDateKey(nextDate);
      days.push({
        date: dateStr,
        dayNumber: i,
        dayNameTamil: tamilDays[nextDate.getDay()],
        dayOfWeek: nextDate.getDay(),
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isBlocked: blockedList.includes(dateStr)
      });
    }

    this.astrologerCalendarDays = days;
    this.cdr.detectChanges();
  }

  prevAstrologerMonth(): void {
    this.astrologerCalendarDate = new Date(this.astrologerCalendarDate.getFullYear(), this.astrologerCalendarDate.getMonth() - 1, 1);
    this.generateAstrologerMonthCalendar();
  }

  nextAstrologerMonth(): void {
    this.astrologerCalendarDate = new Date(this.astrologerCalendarDate.getFullYear(), this.astrologerCalendarDate.getMonth() + 1, 1);
    this.generateAstrologerMonthCalendar();
  }

  jumpToAstrologerTodayMonth(): void {
    this.astrologerCalendarDate = new Date();
    this.generateAstrologerMonthCalendar();
  }

  getBlockedDaysCount(): number {
    if (!this.selectedAstrologerForManage || !this.astrologerCalendarDays) return 0;
    return this.astrologerCalendarDays.filter(d => d.isCurrentMonth && d.isBlocked).length;
  }

  getAstrologerMonthNameTamil(): string {
    const tamilMonths = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
    const engMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const m = this.astrologerCalendarDate.getMonth();
    const y = this.astrologerCalendarDate.getFullYear();
    return `${tamilMonths[m]} ${y} (${engMonths[m]} ${y})`;
  }

  toggleAstrologerDate(date: string, targetStatus: 'busy' | 'available'): void {
    if (!this.selectedAstrologerForManage) return;
    const dateStr = String(date).substring(0, 10);
    const isNowBlocked = targetStatus === 'busy';
    let list = this.selectedAstrologerForManage.blocked_dates || [];

    if (isNowBlocked) {
      if (!list.includes(dateStr)) list.push(dateStr);
    } else {
      list = list.filter((d: string) => d !== dateStr);
    }
    this.selectedAstrologerForManage.blocked_dates = list;
    this.generateAstrologerMonthCalendar();

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/astrologers/${this.selectedAstrologerForManage.id}/availability/toggle`, {
      date: dateStr,
      status: targetStatus
    }, headers).subscribe({
      next: (res) => {
        if (this.selectedAstrologerForManage && res.blocked_dates) {
          this.selectedAstrologerForManage.blocked_dates = res.blocked_dates;
          const matched = this.astrologersList.find(a => a.id === this.selectedAstrologerForManage?.id);
          if (matched) matched.blocked_dates = res.blocked_dates;
        }
      }
    });
  }

  blockAllSundaysForAstrologer(): void {
    if (!this.selectedAstrologerForManage) return;
    const sundays = this.astrologerCalendarDays.filter(d => d.isCurrentMonth && d.dayOfWeek === 0 && !d.isBlocked);
    if (sundays.length === 0) {
      alert('இந்த மாதத்தின் அனைத்து ஞாயிற்றுக்கிழமைகளும் ஏற்கனவே விடுப்பு நாட்களாக முடக்கப்பட்டுள்ளன.');
      return;
    }
    sundays.forEach(s => this.toggleAstrologerDate(s.date, 'busy'));
  }

  unblockAllDaysForAstrologer(): void {
    if (!this.selectedAstrologerForManage) return;
    const blockedDays = this.astrologerCalendarDays.filter(d => d.isCurrentMonth && d.isBlocked);
    if (blockedDays.length === 0) {
      alert('இந்த மாதத்தில் விடுப்பு நாட்கள் எதுவும் இல்லை.');
      return;
    }
    blockedDays.forEach(b => this.toggleAstrologerDate(b.date, 'available'));
  }

  addQuickSlot(slot: string): void {
    if (!this.selectedAstrologerForManage) return;
    if (!this.selectedAstrologerForManage.available_slots.includes(slot)) {
      this.selectedAstrologerForManage.available_slots.push(slot);
      this.saveAstrologerSlots();
    }
  }

  addAstrologerSlot(): void {
    if (!this.newSlotInput.trim() || !this.selectedAstrologerForManage) return;
    const slot = this.newSlotInput.trim();
    if (!this.selectedAstrologerForManage.available_slots.includes(slot)) {
      this.selectedAstrologerForManage.available_slots.push(slot);
    }
    this.newSlotInput = '';
    this.saveAstrologerSlots();
  }

  removeAstrologerSlot(index: number): void {
    if (!this.selectedAstrologerForManage) return;
    this.selectedAstrologerForManage.available_slots.splice(index, 1);
    this.saveAstrologerSlots();
  }

  saveAstrologerSlots(): void {
    if (!this.selectedAstrologerForManage) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/astrologers/${this.selectedAstrologerForManage.id}/slots`, {
      slots: this.selectedAstrologerForManage.available_slots
    }, headers).subscribe({
      next: () => {
        const matched = this.astrologersList.find(a => a.id === this.selectedAstrologerForManage.id);
        if (matched) matched.available_slots = [...this.selectedAstrologerForManage.available_slots];
      }
    });
  }

  onAstrologerPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('புகைப்படத்தின் அளவு 2MB-க்குள் இருக்க வேண்டும்.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.selectedAstrologerForManage) {
          this.selectedAstrologerForManage.avatar_url = e.target.result;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeAstrologerPhoto(): void {
    if (this.selectedAstrologerForManage) {
      this.selectedAstrologerForManage.avatar_url = null;
      this.cdr.detectChanges();
    }
  }

  selectPresetAvatar(icon: string): void {
    if (this.selectedAstrologerForManage) {
      this.selectedAstrologerForManage.avatar_icon = icon;
      this.cdr.detectChanges();
    }
  }

  saveAstrologerFullProfile(): void {
    if (!this.selectedAstrologerForManage) return;
    if (!this.selectedAstrologerForManage.name || !this.selectedAstrologerForManage.name.trim()) {
      alert('தயவுசெய்து ஜோதிடரின் பெயரை உள்ளிடவும்.');
      return;
    }
    this.astrologerSaving = true;
    const headers = this.authService.getAuthHeaders();

    if (this.isCreatingNewAstrologer || !this.selectedAstrologerForManage.id) {
      this.http.post<any>('http://127.0.0.1:8000/api/admin/astrologers', this.selectedAstrologerForManage, headers).subscribe({
        next: (res) => {
          this.astrologerSaving = false;
          this.astrologerSuccessMsg = '✅ புதிய ஜோதிடர் வெற்றிகரமாக சேர்க்கப்பட்டார்!';
          this.isCreatingNewAstrologer = false;
          if (res.astrologer) {
            this.selectedAstrologerForManage = {
              ...res.astrologer,
              available_slots: Array.isArray(res.astrologer.available_slots) ? [...res.astrologer.available_slots] : [],
              blocked_dates: Array.isArray(res.astrologer.blocked_dates) ? [...res.astrologer.blocked_dates] : []
            };
          }
          this.loadAstrologers();
          setTimeout(() => {
            this.astrologerSuccessMsg = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.astrologerSaving = false;
          alert(err.error?.message || '❌ ஜோதிடரை சேர்ப்பதில் பிழை ஏற்பட்டது.');
        }
      });
    } else {
      this.http.put<any>(`http://127.0.0.1:8000/api/admin/astrologers/${this.selectedAstrologerForManage.id}`, this.selectedAstrologerForManage, headers).subscribe({
        next: (res) => {
          this.astrologerSaving = false;
          this.astrologerSuccessMsg = '✅ ஜோதிடர் விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!';
          this.loadAstrologers();
          setTimeout(() => {
            this.astrologerSuccessMsg = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: () => {
          this.astrologerSaving = false;
          alert('❌ விவரங்களை சேமிப்பதில் பிழை ஏற்பட்டது.');
        }
      });
    }
  }

  getBookingCount(status: string): number {
    return this.serviceBookings.filter(b => b.status === status).length;
  }

  getFilteredBookings(): any[] {
    let list = this.serviceBookings;
    if (this.bookingFilterStatus !== 'all') {
      list = list.filter(b => b.status === this.bookingFilterStatus);
    }
    if (this.bookingSearchQuery && this.bookingSearchQuery.trim()) {
      const q = this.bookingSearchQuery.toLowerCase().trim();
      list = list.filter(b =>
        (b.user_name && b.user_name.toLowerCase().includes(q)) ||
        (b.user_phone && b.user_phone.toLowerCase().includes(q)) ||
        (b.service_type && b.service_type.toLowerCase().includes(q)) ||
        (String(b.id).toLowerCase().includes(q)) ||
        (b.details?.query && b.details.query.toLowerCase().includes(q)) ||
        (b.details?.preferred_date && b.details.preferred_date.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getTotalBookingRevenue(): number {
    return this.serviceBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  }

  openViewBookingModal(booking: any): void {
    this.selectedBookingForView = booking;
  }

  openFulfillModal(booking: any): void {
    this.selectedBookingForFulfill = booking;
    this.fulfillForm = {
      status: booking.status || 'Completed',
      chart_url: booking.chart_url || ''
    };
  }

  submitFulfill(): void {
    if (!this.selectedBookingForFulfill) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/bookings/${this.selectedBookingForFulfill.id}/fulfill`, this.fulfillForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Booking status updated successfully!');
        this.selectedBookingForFulfill = null;
        this.loadBookings();
      },
      error: () => alert('❌ Failed to update booking status.')
    });
  }

  deleteBooking(id: any): void {
    if (!confirm(`Are you sure you want to delete booking #${id}?`)) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/bookings/${id}`, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Booking deleted successfully!');
        this.loadBookings();
      },
      error: () => alert('❌ Failed to delete booking.')
    });
  }

  openManualBookingModal(): void {
    this.manualBookingForm = {
      user_name: '',
      user_phone: '',
      service_type: 'Full Jathagam Reading & Porutham Matching',
      price: 499,
      booking_date: new Date().toISOString().split('T')[0],
      dob: '',
      tob: '',
      pob: '',
      query: ''
    };
    this.manualBookingModalOpen = true;
  }

  submitManualBooking(): void {
    if (!this.manualBookingForm.user_name || !this.manualBookingForm.user_phone) {
      alert('Client name and phone are required.');
      return;
    }

    const payload = {
      user_name: this.manualBookingForm.user_name,
      user_phone: this.manualBookingForm.user_phone,
      service_type: this.manualBookingForm.service_type,
      price: this.manualBookingForm.price,
      booking_date: this.manualBookingForm.booking_date,
      details: {
        dob: this.manualBookingForm.dob,
        tob: this.manualBookingForm.tob,
        pob: this.manualBookingForm.pob,
        query: this.manualBookingForm.query,
        preferred_date: this.manualBookingForm.booking_date
      }
    };

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>('http://127.0.0.1:8000/api/bookings/create', payload, headers).subscribe({
      next: (res) => {
        alert(`Booking #${res.order_id || 'AST'} created successfully!`);
        this.manualBookingModalOpen = false;
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create booking.');
      }
    });
  }
}
