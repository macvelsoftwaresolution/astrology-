import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Subcomponents
import { OverviewTabComponent } from './tabs/overview-tab/overview-tab.component';
import { TeamTabComponent } from './tabs/team-tab/team-tab.component';
import { LmsTabComponent } from './tabs/lms-tab/lms-tab.component';
import { CourierTabComponent } from './tabs/courier-tab/courier-tab.component';
import { GradingTabComponent } from './tabs/grading-tab/grading-tab.component';
import { ServicesTabComponent } from './tabs/services-tab/services-tab.component';
import { RasiEditorTabComponent } from './tabs/rasi-editor-tab/rasi-editor-tab.component';
import { MatchesTabComponent } from './tabs/matches-tab/matches-tab.component';
import { PaymentsTabComponent } from './tabs/payments-tab/payments-tab.component';
import { BroadcastTabComponent } from './tabs/broadcast-tab/broadcast-tab.component';
import { UsersTabComponent } from './tabs/users-tab/users-tab.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    OverviewTabComponent,
    TeamTabComponent,
    LmsTabComponent,
    CourierTabComponent,
    GradingTabComponent,
    ServicesTabComponent,
    RasiEditorTabComponent,
    MatchesTabComponent,
    PaymentsTabComponent,
    BroadcastTabComponent,
    UsersTabComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentTab = 'overview';
  currentUser: User | null = null;
  mobileMenuOpen = false;

  // Sidebar Category Dropdown States
  astrologyCategoryOpen = true;
  learnCategoryOpen = true;

  // Admin Profile Modal State
  adminProfileModalOpen = false;
  adminProfileForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    new_password: ''
  };
  adminProfileSaving = false;
  adminProfileSuccessMsg = '';
  adminProfileErrMsg = '';

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  setLanguage(lang: LanguageCode): void {
    this.translationService.setLanguage(lang);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        // Auto-expand the category if a tab within it is selected
        if (this.isAstrologyActive()) {
          this.astrologyCategoryOpen = true;
        } else if (this.isLearnActive()) {
          this.learnCategoryOpen = true;
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleAstrologyCategory(): void {
    this.astrologyCategoryOpen = !this.astrologyCategoryOpen;
  }

  toggleLearnCategory(): void {
    this.learnCategoryOpen = !this.learnCategoryOpen;
  }

  isAstrologyActive(): boolean {
    return ['team', 'services', 'rasi-editor', 'matches'].includes(this.currentTab);
  }

  isLearnActive(): boolean {
    return ['lms', 'courier', 'grading'].includes(this.currentTab);
  }

  selectTab(tabName: string): void {
    this.currentTab = tabName;
    this.mobileMenuOpen = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge'
    });
  }

  openAdminProfileModal(): void {
    this.currentUser = this.authService.getUser();
    this.adminProfileForm = {
      name: this.currentUser?.name || '',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phone || '',
      address: (this.currentUser as any)?.address || '',
      new_password: ''
    };
    this.adminProfileSuccessMsg = '';
    this.adminProfileErrMsg = '';
    this.adminProfileModalOpen = true;
  }

  saveAdminProfile(): void {
    this.adminProfileSaving = true;
    this.adminProfileSuccessMsg = '';
    this.adminProfileErrMsg = '';

    const payload: any = {
      name: this.adminProfileForm.name,
      email: this.adminProfileForm.email,
      phone: this.adminProfileForm.phone,
      address: this.adminProfileForm.address
    };

    if (this.adminProfileForm.new_password) {
      payload.new_password = this.adminProfileForm.new_password;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.put<any>('http://127.0.0.1:8000/api/user/profile', payload, headers).subscribe({
      next: (res) => {
        this.adminProfileSaving = false;
        if (res.user) {
          this.currentUser = res.user;
          this.authService.setUser(res.user);
        }
        this.adminProfileSuccessMsg = '✅ சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.adminProfileModalOpen = false;
          this.adminProfileSuccessMsg = '';
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        this.adminProfileSaving = false;
        this.adminProfileErrMsg = err?.error?.message || 'சுயவிவரத்தைப் புதுப்பிப்பதில் பிழை ஏற்பட்டது.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
