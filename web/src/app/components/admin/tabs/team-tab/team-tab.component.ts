import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-team-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './team-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './team-tab.component.css']
})
export class TeamTabComponent implements OnInit {
  teamList: any[] = [];
  isLoading = false;
  openAddAdminModal = false;
  newAdmin = { name: '', email: '', password: '', phone: '', role: 'admin' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeam();
  }

  loadTeam(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/team', headers).subscribe({
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
    this.http.post<any>('http://127.0.0.1:8000/api/admin/create-admin', this.newAdmin, headers).subscribe({
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
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/team/${id}`, headers).subscribe({
      next: () => {
        alert('Account deleted successfully.');
        this.loadTeam();
      },
      error: () => alert('Failed to delete account.')
    });
  }
}
