import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './users-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './users-tab.component.css']
})
export class UsersTabComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  userSearchQuery = '';
  selectedUserForProfile: any = null;

  batches: any[] = [];
  selectedBatchFilter: string = 'all'; // 'all', or batch.id or batch.name

  // Modals for batch
  openCreateBatchModal = false;
  openShiftBatchModal = false;
  selectedUserForBatchShift: any = null;
  shiftTargetBatchId: number | null = null;
  isBatchSubmitting = false;

  newBatch = {
    name: '',
    batch_code: '',
    course_level: 'all',
    start_date: '',
    end_date: '',
    status: 'active',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadUsers();
      this.loadBatches();
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/users`, headers).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch { }
        try { this.cdr.detectChanges(); } catch { }
      },
      error: () => {
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch { }
        try { this.cdr.detectChanges(); } catch { }
      }
    });
  }

  loadBatches(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/batches`, headers).subscribe({
      next: (res) => {
        if (res && res.batches) {
          this.batches = res.batches;
        }
        try { this.cdr.markForCheck(); } catch { }
        try { this.cdr.detectChanges(); } catch { }
      },
      error: () => { }
    });
  }

  selectBatchFilter(filter: string): void {
    this.selectedBatchFilter = filter;
  }

  getBatchStudentCount(batch: any): number {
    return this.nonAdminUsers.filter(u => {
      if (!this.isStudent(u)) return false;
      if (u.batch_id && String(u.batch_id) === String(batch.id)) return true;
      if (u.batch_name && (u.batch_name.includes(batch.name) || batch.name.includes(u.batch_name))) return true;
      return false;
    }).length;
  }

  openCreateBatch(): void {
    this.newBatch = {
      name: '',
      batch_code: '',
      course_level: 'all',
      start_date: '',
      end_date: '',
      status: 'active',
      description: ''
    };
    this.openCreateBatchModal = true;
  }

  submitCreateBatch(): void {
    if (!this.newBatch.name.trim()) {
      this.toastService.error('Please enter a batch name.', 'பேட்ச் பெயர் அவசியம்');
      return;
    }
    this.isBatchSubmitting = true;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/batches`, this.newBatch, headers).subscribe({
      next: (res) => {
        this.isBatchSubmitting = false;
        this.openCreateBatchModal = false;
        this.toastService.success('Batch created successfully.', 'பேட்ச் உருவாக்கப்பட்டது');
        this.loadBatches();
      },
      error: (err) => {
        this.isBatchSubmitting = false;
        this.toastService.error(err?.error?.message || 'Failed to create batch.', 'பிழை ஏற்பட்டது');
      }
    });
  }

  openShiftModal(user: any): void {
    this.selectedUserForBatchShift = user;
    this.shiftTargetBatchId = user.batch_id || (this.batches.length > 0 ? this.batches[0].id : null);
    this.openShiftBatchModal = true;
  }

  submitShiftBatch(): void {
    if (!this.selectedUserForBatchShift) return;
    this.isBatchSubmitting = true;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(
      `${environment.apiUrl}/admin/students/${this.selectedUserForBatchShift.id}/shift-batch`,
      { batch_id: this.shiftTargetBatchId },
      headers
    ).subscribe({
      next: (res) => {
        this.isBatchSubmitting = false;
        this.openShiftBatchModal = false;
        this.toastService.success('Student moved to new batch successfully.', 'மாணவர் பேட்ச் மாற்றப்பட்டது');
        this.loadUsers();
        this.loadBatches();
      },
      error: (err) => {
        this.isBatchSubmitting = false;
        this.toastService.error(err?.error?.message || 'Failed to shift student batch.', 'பிழை ஏற்பட்டது');
      }
    });
  }

  selectedCategoryFilter: 'all' | 'students' | 'appointments' | 'both' | 'members' = 'all';
  isFilterDropdownOpen = false;
  isBatchDropdownOpen = false;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isFilterDropdownOpen = false;
    this.isBatchDropdownOpen = false;
  }

  toggleFilterDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    this.isBatchDropdownOpen = false;
  }

  closeFilterDropdown(): void {
    this.isFilterDropdownOpen = false;
  }

  selectFilter(filter: 'all' | 'students' | 'appointments' | 'both' | 'members', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedCategoryFilter = filter;
    this.isFilterDropdownOpen = false;
  }

  toggleBatchDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isBatchDropdownOpen = !this.isBatchDropdownOpen;
    this.isFilterDropdownOpen = false;
  }

  closeBatchDropdown(): void {
    this.isBatchDropdownOpen = false;
  }

  selectBatch(batchNameOrAll: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedBatchFilter = batchNameOrAll;
    this.isBatchDropdownOpen = false;
  }

  formatBatchName(name: string): string {
    if (!name) return '';
    const isTa = this.translationService.currentLanguage() === 'ta';
    if (isTa) {
      return name.replace(/Batch\s*A/gi, 'பிரிவு A')
        .replace(/Batch\s*B/gi, 'பிரிவு B')
        .replace(/Batch\s*C/gi, 'பிரிவு C')
        .replace(/Batch\s*D/gi, 'பிரிவு D')
        .replace(/Batch\s*(\d+)/gi, 'பிரிவு $1')
        .replace(/Feb\s*-\s*Apr/gi, 'பிப் - ஏப்')
        .replace(/May\s*-\s*Jul/gi, 'மே - ஜூலை')
        .replace(/Aug\s*-\s*Oct/gi, 'ஆக - அக்')
        .replace(/Nov\s*-\s*Jan/gi, 'நவ - ஜன')
        .replace(/Jul\s*-\s*Sep/gi, 'ஜூலை - செப்')
        .replace(/Oct\s*-\s*Dec/gi, 'அக் - டிச')
        .replace(/Jan\s*-\s*Mar/gi, 'ஜன - மார்')
        .replace(/Apr\s*-\s*Jun/gi, 'ஏப் - ஜூன்');
    } else {
      return name.replace(/பிரிவு\s*A/gi, 'Batch A')
        .replace(/பிரிவு\s*B/gi, 'Batch B')
        .replace(/பிரிவு\s*C/gi, 'Batch C')
        .replace(/பிரிவு\s*D/gi, 'Batch D')
        .replace(/பிரிவு\s*(\d+)/gi, 'Batch $1');
    }
  }

  getActiveBatchName(): string {
    if (this.selectedBatchFilter === 'all') {
      return this.translationService.instant('users.allBatches');
    }
    return this.formatBatchName(this.selectedBatchFilter);
  }

  getActiveBatchCount(): number {
    if (this.selectedBatchFilter === 'all') {
      return this.studentsCount;
    }
    const found = this.batches.find(b => b.name === this.selectedBatchFilter || String(b.id) === String(this.selectedBatchFilter));
    return found ? this.getBatchStudentCount(found) : 0;
  }

  getActiveFilterIcon(): string {
    switch (this.selectedCategoryFilter) {
      case 'students': return 'bi bi-mortarboard-fill';
      case 'appointments': return 'bi bi-calendar2-check-fill';
      case 'both': return 'bi bi-stars';
      case 'members': return 'bi bi-person-badge-fill';
      default: return 'bi bi-people-fill';
    }
  }

  getActiveFilterKey(): string {
    switch (this.selectedCategoryFilter) {
      case 'students': return 'users.studentsOnly';
      case 'appointments': return 'users.appointmentsOnly';
      case 'both': return 'users.bothStudentsAndAppointments';
      case 'members': return 'users.generalMembers';
      default: return 'users.allUsers';
    }
  }

  getActiveFilterCount(): number {
    switch (this.selectedCategoryFilter) {
      case 'students': return this.studentsCount;
      case 'appointments': return this.appointmentsCount;
      case 'both': return this.bothCount;
      case 'members': return this.membersCount;
      default: return this.nonAdminUsers.length;
    }
  }

  getFilteredUsers(): any[] {
    let list = this.users.filter(u => u.role !== 'admin');

    // 1. Category Filter
    if (this.selectedCategoryFilter === 'students') {
      list = list.filter(u => this.isStudent(u));
    } else if (this.selectedCategoryFilter === 'appointments') {
      list = list.filter(u => this.isAppointmentUser(u));
    } else if (this.selectedCategoryFilter === 'both') {
      list = list.filter(u => this.isBothStudentAndAppointment(u));
    } else if (this.selectedCategoryFilter === 'members') {
      // In Members view: show all registered non-admin members
      list = list;
    }

    // 2. Batch Filter (Active when looking at students or all)
    if (this.selectedBatchFilter !== 'all') {
      list = list.filter(u => {
        if (!this.isStudent(u)) return false;
        if (u.batch_id && String(u.batch_id) === String(this.selectedBatchFilter)) return true;
        if (u.batch_name && (u.batch_name.includes(this.selectedBatchFilter) || this.selectedBatchFilter.includes(u.batch_name))) return true;
        return false;
      });
    }

    // 3. Search Query Filter
    if (this.userSearchQuery && this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.toLowerCase().trim();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.student_id && u.student_id.toLowerCase().includes(q)) ||
        (u.batch_name && u.batch_name.toLowerCase().includes(q)) ||
        ((u.jathagam_details?.rasi || u.jathagam_profile?.rasi) && (u.jathagam_details?.rasi || u.jathagam_profile?.rasi).toLowerCase().includes(q)) ||
        ((u.jathagam_details?.star || u.jathagam_details?.nakshatra || u.jathagam_profile?.nakshatra) && (u.jathagam_details?.star || u.jathagam_details?.nakshatra || u.jathagam_profile?.nakshatra).toLowerCase().includes(q))
      );
    }
    return list;
  }

  get nonAdminUsers(): any[] {
    return this.users.filter(u => u.role !== 'admin');
  }

  get studentsCount(): number {
    return this.nonAdminUsers.filter(u => this.isStudent(u)).length;
  }

  get appointmentsCount(): number {
    return this.nonAdminUsers.filter(u => this.isAppointmentUser(u)).length;
  }

  get bothCount(): number {
    return this.nonAdminUsers.filter(u => this.isBothStudentAndAppointment(u)).length;
  }

  get membersCount(): number {
    return this.nonAdminUsers.length;
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this registered user?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/users/${id}`, headers).subscribe({
      next: () => {
        this.toastService.success('User deleted successfully.', 'பயனர் நீக்கப்பட்டார்');
        this.loadUsers();
      },
      error: () => this.toastService.error('Failed to delete user.', 'பிழை ஏற்பட்டது')
    });
  }

  getParsedDetails(u: any): any {
    if (!u) return null;
    if (u.jathagam_details && typeof u.jathagam_details === 'string') {
      try {
        u.jathagam_details = JSON.parse(u.jathagam_details);
      } catch {
        // ignore
      }
    }
    return u.jathagam_details || u.jathagam_profile || null;
  }

  isStudent(u: any): boolean {
    if (!u) return false;
    const d = this.getParsedDetails(u);
    return !!(u.student_id || d?.courseLevel || d?.studentNameTamil || d?.fatherName || d?.qualification);
  }

  isAppointmentUser(u: any): boolean {
    if (!u) return false;
    return !!(u.bookings_count && u.bookings_count > 0);
  }

  isBothStudentAndAppointment(u: any): boolean {
    return this.isStudent(u) && this.isAppointmentUser(u);
  }

  getStudentLevel(u: any): string {
    const d = this.getParsedDetails(u);
    const lvl = d?.courseLevel?.toLowerCase() || 'ilanilai';
    const isMuthu = (lvl === 'mudhunilai' || lvl === 'muthunilai');
    if (this.translationService.currentLanguage() === 'ta') {
      return isMuthu ? 'முதுநிலை' : 'இளநிலை';
    }
    return isMuthu ? 'Muthunilai' : 'Ilanilai';
  }

  getDateParts(rawDate: any): { date: string; time: string } {
    const isTa = this.translationService.currentLanguage() === 'ta';
    if (!rawDate) {
      return {
        date: isTa ? 'இன்று' : 'Today',
        time: isTa ? 'நேரலை' : 'Live'
      };
    }
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return { date: String(rawDate), time: '' };

      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayNamesTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const monthNamesTa = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];

      const dateNum = d.getDate();
      const monthStr = isTa ? monthNamesTa[d.getMonth()] : monthNamesEn[d.getMonth()];
      const yearStr = d.getFullYear();
      const dayStr = isTa ? dayNamesTa[d.getDay()] : dayNamesEn[d.getDay()];

      let hours = d.getHours();
      const isPm = hours >= 12;
      const minutes = d.getMinutes().toString().padStart(2, '0');
      hours = hours % 12;
      hours = hours ? hours : 12;

      const ampmStr = isTa ? (isPm ? 'பிற்பகல்' : 'முற்பகல்') : (isPm ? 'PM' : 'AM');

      return {
        date: `${dateNum} ${monthStr} ${yearStr}`,
        time: `${hours}:${minutes} ${ampmStr} (${dayStr})`
      };
    } catch {
      return { date: String(rawDate), time: '' };
    }
  }

  formatDynamicDate(rawDate: any): string {
    const p = this.getDateParts(rawDate);
    return `${p.date} • ${p.time}`;
  }

  formatQualification(q: string): string {
    if (!q) return '-';
    const isTa = this.translationService.currentLanguage() === 'ta';
    const lower = q.toLowerCase();
    if (lower.includes('postgraduate') || lower.includes('pg') || lower.includes('master')) {
      return isTa ? 'முதுகலைப்பட்டம்' : 'Postgraduate (PG)';
    }
    if (lower.includes('undergraduate') || lower.includes('ug') || lower.includes('bachelor') || lower.includes('degree')) {
      return isTa ? 'இளங்கலைப்பட்டம்' : 'Undergraduate (UG)';
    }
    if (lower.includes('diploma')) {
      return isTa ? 'பட்டயப்படிப்பு' : 'Diploma';
    }
    if (lower.includes('12') || lower.includes('hsc') || lower.includes('+2')) {
      return isTa ? 'மேல்நிலைக்கல்வி' : 'Higher Secondary (12th)';
    }
    if (lower.includes('10') || lower.includes('sslc')) {
      return isTa ? 'பத்தாம் வகுப்பு' : 'Secondary School (10th)';
    }
    if (lower.includes('phd') || lower.includes('doctorate')) {
      return isTa ? 'முனைவர் பட்டம்' : 'Doctorate (Ph.D)';
    }
    return q;
  }

  formatOccupation(occ: string): string {
    if (!occ) return '-';
    const isTa = this.translationService.currentLanguage() === 'ta';
    const lower = occ.toLowerCase();
    if (lower.includes('kooli') || lower.includes('coolie') || lower.includes('daily')) {
      return isTa ? 'தினக்கூலி / தொழிலாளி' : 'Daily Wage / Worker';
    }
    if (lower.includes('business') || lower.includes('வியாபாரம்')) {
      return isTa ? 'சுயதொழில் / வியாபாரம்' : 'Business / Self Employed';
    }
    if (lower.includes('private') || lower.includes('தனியார்')) {
      return isTa ? 'தனியார் பணி' : 'Private Sector';
    }
    if (lower.includes('govt') || lower.includes('அரசு')) {
      return isTa ? 'அரசுப் பணி' : 'Government Service';
    }
    if (lower.includes('student') || lower.includes('மாணவர்')) {
      return isTa ? 'மாணவர்' : 'Student';
    }
    if (lower.includes('home') || lower.includes('housewife')) {
      return isTa ? 'இல்லத்தரசி' : 'Home Maker';
    }
    if (lower.includes('retired')) {
      return isTa ? 'ஓய்வு பெற்றவர்' : 'Retired';
    }
    return occ;
  }

  formatGender(g: string): string {
    if (!g) return '-';
    const isTa = this.translationService.currentLanguage() === 'ta';
    const lower = g.toLowerCase();
    if (lower === 'male' || lower === 'ஆண்') return isTa ? 'ஆண்' : 'Male';
    if (lower === 'female' || lower === 'பெண்') return isTa ? 'பெண்' : 'Female';
    if (lower === 'other' || lower === 'மற்றவை') return isTa ? 'மற்றவை' : 'Other';
    return g;
  }
}
