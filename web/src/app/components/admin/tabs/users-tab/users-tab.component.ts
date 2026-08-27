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

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isFilterDropdownOpen = false;
  }

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

  selectedCategoryFilter: 'all' | 'students' | 'appointments' | 'both' | 'members' = 'all';
  isFilterDropdownOpen = false;

  toggleFilterDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
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
      list = list.filter(u => !this.isStudent(u) && !this.isAppointmentUser(u));
    }

    // 2. Search Query Filter
    if (this.userSearchQuery && this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.toLowerCase().trim();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
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
    return this.nonAdminUsers.filter(u => !this.isStudent(u) && !this.isAppointmentUser(u)).length;
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
    return !!(u.student_id || d?.courseLevel || d?.studentNameTamil || d?.fatherName || d?.trainingMode || d?.qualification);
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
    return (lvl === 'mudhunilai' || lvl === 'muthunilai') ? 'முதுநிலை (Muthunilai)' : 'இளநிலை (Ilanilai)';
  }

  getDateParts(rawDate: any): { date: string; time: string } {
    if (!rawDate) {
      return { date: 'இன்று (Today)', time: 'நேரலை' };
    }
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return { date: String(rawDate), time: '' };

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dateNum = d.getDate();
      const monthStr = monthNames[d.getMonth()];
      const yearStr = d.getFullYear();
      const dayStr = dayNames[d.getDay()];

      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;

      return {
        date: `${dateNum} ${monthStr} ${yearStr}`,
        time: `${hours}:${minutes} ${ampm} (${dayStr})`
      };
    } catch {
      return { date: String(rawDate), time: '' };
    }
  }

  formatDynamicDate(rawDate: any): string {
    const p = this.getDateParts(rawDate);
    return `${p.date} • ${p.time}`;
  }
}
