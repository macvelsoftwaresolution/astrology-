import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        this.cdr.detectChanges();
      }
    });
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
