import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/users', headers).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFilteredUsers(): any[] {
    let list = this.users;
    if (this.userSearchQuery && this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.toLowerCase().trim();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.jathagam_profile?.rasi && u.jathagam_profile.rasi.toLowerCase().includes(q)) ||
        (u.jathagam_profile?.nakshatra && u.jathagam_profile.nakshatra.toLowerCase().includes(q))
      );
    }
    return list;
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this registered user?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/users/${id}`, headers).subscribe({
      next: () => {
        alert('User deleted successfully.');
        this.loadUsers();
      },
      error: () => alert('Failed to delete user.')
    });
  }
}
