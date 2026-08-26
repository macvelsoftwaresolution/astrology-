import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

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
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: () => {
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  getFilteredUsers(): any[] {
    let list = this.users.filter(u => u.role !== 'admin');
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
