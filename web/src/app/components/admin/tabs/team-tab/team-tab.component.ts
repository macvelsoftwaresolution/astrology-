import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-team-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './team-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './team-tab.component.css']
})
export class TeamTabComponent implements OnInit {
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

  activeView: 'admins' | 'astrologers' = 'astrologers';
  teamList: any[] = [];
  isLoading = false;
  openAddAdminModal = false;
  newAdmin = { name: '', email: '', password: '', phone: '', role: 'admin' };

  astrologersList: any[] = [];
  isAstrologersLoading = false;
  selectedAstrologerForManage: any = null;
  isCreatingNewAstrologer = false;
  astrologerManageTab: 'profile' | 'slots' | 'calendar' = 'profile';
  newSlotInput = '';
  astrologerCalendarDays: any[] = [];
  astrologerCalendarDate: Date = new Date();
  astrologerSaving = false;
  astrologerSuccessMsg = '';
  isUploadingAstrologerAvatar = false;

  predefinedCategories: string[] = [
    'ஜாதகம் எழுதுதல்',
    'வாஸ்து சாஸ்திரம்',
    'எண்கணிதம் / நியூமராலஜி'
  ];
  customCategoryMode = false;
  customCategoryInput = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadTeam();
      this.loadAstrologers();
    }
  }

  // ================= ADMINS / TEAM CRUD =================
  loadTeam(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/team`, headers).subscribe({
      next: (res) => {
        this.teamList = res.admins || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createAdmin(): void {
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      alert('Please fill all required fields.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/create-admin`, this.newAdmin, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Account created successfully!');
        this.openAddAdminModal = false;
        this.newAdmin = { name: '', email: '', password: '', phone: '', role: 'admin' };
        this.loadTeam();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create account.');
      }
    });
  }

  deleteTeamMember(id: number): void {
    if (!confirm('Are you sure you want to delete this administrator / astrologer account?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/team/${id}`, headers).subscribe({
      next: () => {
        alert('Account deleted successfully.');
        this.loadTeam();
      },
      error: () => alert('Failed to delete account.')
    });
  }

  // ================= ASTROLOGERS CRUD =================
  loadAstrologers(): void {
    this.isAstrologersLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/astrologers`, headers).subscribe({
      next: (res) => {
        this.astrologersList = res.astrologers || [];
        this.isAstrologersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.astrologersList = [];
        this.isAstrologersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCategorySelectChange(event: any): void {
    const val = event.target.value;
    if (val === '__NEW__') {
      this.customCategoryMode = true;
      this.customCategoryInput = '';
    } else {
      this.customCategoryMode = false;
      if (this.selectedAstrologerForManage) {
        this.selectedAstrologerForManage.category = val;
      }
    }
  }

  openNewAstrologerModal(): void {
    this.isCreatingNewAstrologer = true;
    this.customCategoryMode = false;
    this.customCategoryInput = '';
    this.selectedAstrologerForManage = {
      id: null,
      name: '',
      category: 'ஜாதகம் எழுதுதல்',
      role_title: 'தலைமை வேத ஜோதிடர்',
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
      consultation_count: 0,
      is_phone_call_available: true,
      phone_call_fee: 499,
      is_video_call_available: true,
      video_call_fee: 699,
      is_audio_call_available: true,
      audio_call_fee: 499
    };
    this.astrologerManageTab = 'profile';
    this.astrologerCalendarDate = new Date();
    this.newSlotInput = '';
    this.astrologerSuccessMsg = '';
    this.generateAstrologerMonthCalendar();
  }

  openAstrologerManageModal(astro: any): void {
    this.isCreatingNewAstrologer = false;
    this.customCategoryMode = !!(astro.category && !this.predefinedCategories.includes(astro.category));
    this.customCategoryInput = this.customCategoryMode ? astro.category : '';
    this.selectedAstrologerForManage = {
      ...astro,
      category: astro.category || 'ஜாதகம் எழுதுதல்',
      available_slots: Array.isArray(astro.available_slots) ? [...astro.available_slots] : [],
      blocked_dates: Array.isArray(astro.blocked_dates) ? [...astro.blocked_dates] : []
    };
    this.astrologerManageTab = 'profile';
    this.astrologerCalendarDate = new Date();
    this.newSlotInput = '';
    this.astrologerSuccessMsg = '';
    this.generateAstrologerMonthCalendar();
  }

  onAstrologerPhotoSelected(event: any): void {
    this.uploadAstrologerAvatar(event);
  }

  removeAstrologerPhoto(): void {
    if (this.selectedAstrologerForManage) {
      this.selectedAstrologerForManage.avatar_url = null;
    }
  }

  selectPresetAvatar(pIcon: string): void {
    if (this.selectedAstrologerForManage) {
      this.selectedAstrologerForManage.avatar_icon = pIcon;
    }
  }

  uploadAstrologerAvatar(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingAstrologerAvatar = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'astrologers');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.selectedAstrologerForManage) {
          this.selectedAstrologerForManage.avatar_url = res.url;
        }
        this.isUploadingAstrologerAvatar = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Avatar upload failed.');
        this.isUploadingAstrologerAvatar = false;
        this.cdr.detectChanges();
      }
    });
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
    this.http.delete<any>(`${environment.apiUrl}/admin/astrologers/${astro.id}`, headers).subscribe({
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
    this.http.post<any>(`${environment.apiUrl}/admin/astrologers/${this.selectedAstrologerForManage.id}/availability/toggle`, {
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
    this.http.put<any>(`${environment.apiUrl}/admin/astrologers/${this.selectedAstrologerForManage.id}/slots`, {
      slots: this.selectedAstrologerForManage.available_slots
    }, headers).subscribe({
      next: () => {
        const matched = this.astrologersList.find(a => a.id === this.selectedAstrologerForManage.id);
        if (matched) matched.available_slots = [...this.selectedAstrologerForManage.available_slots];
      }
    });
  }

  saveAstrologerFullProfile(): void {
    if (!this.selectedAstrologerForManage) return;
    if (!this.selectedAstrologerForManage.name || !this.selectedAstrologerForManage.name.trim()) {
      alert('தயவுசெய்து ஜோதிடரின் பெயரை உள்ளிடவும்.');
      return;
    }
    if (this.customCategoryMode && this.customCategoryInput.trim()) {
      this.selectedAstrologerForManage.category = this.customCategoryInput.trim();
    }
    this.astrologerSaving = true;
    const headers = this.authService.getAuthHeaders();

    if (this.isCreatingNewAstrologer || !this.selectedAstrologerForManage.id) {
      this.http.post<any>(`${environment.apiUrl}/admin/astrologers`, this.selectedAstrologerForManage, headers).subscribe({
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
      this.http.put<any>(`${environment.apiUrl}/admin/astrologers/${this.selectedAstrologerForManage.id}`, this.selectedAstrologerForManage, headers).subscribe({
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
}
