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
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- MOBILE TOPBAR WITH HAMBURGER MENU -->
      <div class="mobile-topbar">
        <div class="brand">
          <span class="icon">✨</span>
          <h2>Astro Divine</h2>
        </div>
        <button class="hamburger-btn" (click)="mobileMenuOpen = !mobileMenuOpen">
          {{ mobileMenuOpen ? '✕ Close' : '☰ Menu' }}
        </button>
      </div>

      <!-- SLEEK LEFT SIDEBAR (Desktop Fixed, Mobile Slide Drawer) -->
      <aside class="sidebar" [class.mobile-open]="mobileMenuOpen">
        <div class="brand">
          <span class="icon">✨</span>
          <div style="flex:1">
            <h2>Astro Divine</h2>
            <span class="brand-sub">Management Engine</span>
          </div>
          <button class="drawer-close-btn" (click)="mobileMenuOpen = false">✕</button>
        </div>

        <nav class="nav-menu">
          <button [class.active]="currentTab === 'overview'" (click)="selectTab('overview')">
            <span class="nav-icon">📊</span> Overview & Analytics
          </button>
          <button [class.active]="currentTab === 'team'" (click)="selectTab('team')">
            <span class="nav-icon">🛡️</span> Team & Astrologers
          </button>
          <button [class.active]="currentTab === 'lms'" (click)="selectTab('lms')">
            <span class="nav-icon">📚</span> Learn & Course Studio
          </button>
          <button [class.active]="currentTab === 'courier'" (click)="selectTab('courier')">
            <span class="nav-icon">📦</span> Courier & Book Orders
          </button>
          <button [class.active]="currentTab === 'grading'" (click)="selectTab('grading')">
            <span class="nav-icon">📝</span> Exam Valuation & Certs
          </button>
          <button [class.active]="currentTab === 'services'" (click)="selectTab('services')">
            <span class="nav-icon">🔮</span> Appointment Bookings
          </button>
          <button [class.active]="currentTab === 'rasi-editor'" (click)="selectTab('rasi-editor')">
            <span class="nav-icon">🌟</span> Rasi Palan Editor
          </button>
          <button [class.active]="currentTab === 'matches'" (click)="selectTab('matches')">
            <span class="nav-icon">💑</span> Marriage Match Log
          </button>
          <button [class.active]="currentTab === 'payments'" (click)="selectTab('payments')">
            <span class="nav-icon">💳</span> Payment Transactions
          </button>
          <button [class.active]="currentTab === 'broadcast'" (click)="selectTab('broadcast')">
            <span class="nav-icon">📢</span> Notify Users
          </button>
        </nav>

        <div class="user-card">
          <div class="user-info-row">
            <div class="avatar">{{ currentUser?.name?.charAt(0) || 'A' }}</div>
            <div class="u-details">
              <span class="u-name">{{ currentUser?.name }}</span>
              <span class="u-role">ADMINISTRATOR</span>
            </div>
          </div>
          <button class="btn-logout-full" (click)="logout()">
            <span>🚪 Sign Out / Logout</span>
          </button>
        </div>
      </aside>

      <!-- BACKDROP OVERLAY WHEN MOBILE MENU IS OPEN -->
      @if (mobileMenuOpen) {
        <div class="mobile-backdrop" (click)="mobileMenuOpen = false"></div>
      }

      <!-- MAIN CONTENT PANEL -->
      <main class="main-panel">
        
        <!-- TAB 1: OVERVIEW & ANALYTICS -->
        @if (currentTab === 'overview') {
          <div class="header-banner">
            <div>
              <h1>System Overview & Financial Analytics</h1>
              <p>Platform metrics, revenue streams, student statistics, and live performance indicators.</p>
            </div>
          </div>

          <!-- Key Performance Cards -->
          <div class="metrics-grid">
            <div class="metric-card gold">
              <div class="icon">💰</div>
              <div class="val">₹{{ metrics?.total_revenue | number }}</div>
              <div class="lbl">Total Platform Revenue</div>
            </div>

            <div class="metric-card blue">
              <div class="icon">👨‍🎓</div>
              <div class="val">{{ metrics?.total_students || 0 }}</div>
              <div class="lbl">Total Registered Students</div>
            </div>

            <div class="metric-card purple">
              <div class="icon">📚</div>
              <div class="val">{{ metrics?.total_courses || 0 }}</div>
              <div class="lbl">Active Courses & Syllabuses</div>
            </div>

            <div class="metric-card green">
              <div class="icon">📦</div>
              <div class="val">{{ metrics?.total_book_orders || 0 }}</div>
              <div class="lbl">Book Courier Dispatches</div>
            </div>
          </div>

          <!-- Revenue Breakdown & Quick Overview -->
          <div class="analytics-row">
            <div class="card-box">
              <h3>Revenue Distribution Ledgers</h3>
              <div class="ledger-row">
                <span>📚 Course Sales & LMS Enrollments</span>
                <strong>₹{{ metrics?.revenue_breakdown?.courses | number }}</strong>
              </div>
              <div class="ledger-row">
                <span>🔮 Astrology Service Consultations</span>
                <strong>₹{{ metrics?.revenue_breakdown?.services | number }}</strong>
              </div>
              <div class="ledger-row">
                <span>📦 Physical Book Courier Sales</span>
                <strong>₹{{ metrics?.revenue_breakdown?.books | number }}</strong>
              </div>
            </div>

            <div class="card-box">
              <h3>Astrologer & Admin Roster Summary</h3>
              <div class="team-mini-list">
                @for (member of teamList; track member.id) {
                  <div class="mini-item">
                    <div class="mini-avatar">{{ member.name.charAt(0) }}</div>
                    <div class="mini-info">
                      <strong>{{ member.name }}</strong>
                      <small>{{ member.email }}</small>
                    </div>
                    <span [class]="member.status === 'active' ? 'status active' : 'status suspended'">
                      {{ member.status }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- TAB 2: TEAM & ASTROLOGERS MANAGEMENT -->
        @if (currentTab === 'team') {
          <div class="header-banner flex-between">
            <div>
              <h1>Admin & Astrologer Management</h1>
              <p>Add team members, configure system privileges, and control account activity.</p>
            </div>
            <button class="btn-primary" (click)="openAddAdminModal = true">+ Create Admin Account</button>
          </div>

          <!-- Loading Spinner for Team -->
          @if (isLoadingTeam && teamList.length === 0) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Team Members...</h3>
              <p class="muted" style="margin: 0;">Fetching administrators and astrologer accounts.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (teamList.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (adm of teamList; track adm.id) {
                      <tr>
                        <td>#{{ adm.id }}</td>
                        <td><strong>{{ adm.name }}</strong></td>
                        <td>{{ adm.email }}</td>
                        <td>{{ adm.phone || 'N/A' }}</td>
                        <td><span class="badge-role">{{ adm.role }}</span></td>
                        <td>
                          <span [class]="adm.status === 'active' ? 'status active' : 'status suspended'">
                            {{ adm.status }}
                          </span>
                        </td>
                        <td>
                          <button 
                            class="btn-sm" 
                            [class.danger]="adm.status === 'active'"
                            (click)="toggleAdminStatus(adm.id)"
                          >
                            {{ adm.status === 'active' ? 'Suspend' : 'Activate' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">👥</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Team Members Found</h3>
                  <p class="muted" style="margin: 0;">Click <strong>+ Create Admin Account</strong> above to add team members.</p>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 3: LEARN & COURSE STUDIO (PROFESSIONAL REDESIGN) -->
        @if (currentTab === 'lms') {
          <!-- Header Banner with Title and Action -->
          <div class="header-banner flex-between">
            <div>
              <h1>🎓 Course & Syllabus Management Studio</h1>
              <p>Create & manage astrology courses, structure syllabus modules, attach audio/video lessons, upload PDFs, and manage live classes.</p>
            </div>
            <button class="btn-primary" (click)="openNewCourseWizard()">
              <span>✨ + Step-by-Step Course Builder</span>
            </button>
          </div>

          <!-- KPI Analytics Bar for Course Studio -->
          <div class="metrics-grid" style="margin-bottom: 24px;">
            <div class="metric-card">
              <div class="m-icon">📚</div>
              <div class="m-info">
                <span class="m-label">Active Courses</span>
                <strong class="m-val">{{ courses.length || 0 }}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="m-icon">👥</div>
              <div class="m-info">
                <span class="m-label">Enrolled Students</span>
                <strong class="m-val">{{ metrics?.total_students || 0 }}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="m-icon">💰</div>
              <div class="m-info">
                <span class="m-label">Course Revenue</span>
                <strong class="m-val">₹{{ metrics?.revenue_breakdown?.courses || 0 | number:'1.0-0' }}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="m-icon">📌</div>
              <div class="m-info">
                <span class="m-label">Syllabus Modules & Lessons</span>
                <strong class="m-val">{{ getTotalModulesCount() }} Mod / {{ getTotalLessonsCount() }} Les</strong>
              </div>
            </div>
          </div>

          <!-- Search & Filter Controls Bar -->
          <div class="card-box" style="margin-bottom: 24px; padding: 16px 20px;">
            <div class="course-filters-row">
              <div class="search-box-wrap">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  [(ngModel)]="courseSearchQuery" 
                  placeholder="Search course title or syllabus..." 
                  class="ctrl search-ctrl"
                />
              </div>

              <div class="rasi-type-bar" style="margin-bottom: 0;">
                <button [class.active]="selectedCourseLevelFilter === 'all'" (click)="selectedCourseLevelFilter = 'all'">🌟 All Levels</button>
                <button [class.active]="selectedCourseLevelFilter === 'beginner'" (click)="selectedCourseLevelFilter = 'beginner'">🟢 Beginner</button>
                <button [class.active]="selectedCourseLevelFilter === 'intermediate'" (click)="selectedCourseLevelFilter = 'intermediate'">⚡ Intermediate</button>
                <button [class.active]="selectedCourseLevelFilter === 'advanced'" (click)="selectedCourseLevelFilter = 'advanced'">🔥 Advanced</button>
              </div>
            </div>
          </div>

          <!-- Loading Spinner Skeleton State -->
          @if (isLoadingCourses && courses.length === 0) {
            <div class="card-box empty-state-box" style="grid-column: 1 / -1; text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Course Studio...</h3>
              <p class="muted" style="margin: 0;">Fetching latest courses, syllabus modules, and platform data.</p>
            </div>
          } @else {
            <div class="courses-grid">
              @for (course of getFilteredCourses(); track course.id) {
                <div class="course-card-pro">
                  <!-- Thumbnail Banner with Price & Category Tags -->
                  <div class="card-image-pro" [style.background-image]="'url(' + course.thumbnail + ')'">
                    <div class="card-overlay"></div>
                    <span class="badge-price-pro">₹{{ course.price }}</span>
                    <div class="card-tags-row">
                      <span class="level-tag-pro" [ngClass]="(course.level || 'beginner').toLowerCase()">
                        {{ course.level || 'All Levels' }}
                      </span>
                      <span class="category-tag-pro">
                        {{ course.category || 'Astrology' }}
                      </span>
                    </div>
                  </div>

                  <!-- Content Body -->
                  <div class="card-content-pro">
                    <h4 class="course-title-pro">{{ course.title }}</h4>
                    <p class="course-desc-pro">{{ course.description }}</p>

                    <!-- Course Stats Bar (Clean Summary) -->
                    <div class="course-summary-stats-bar">
                      <div class="stat-pill">
                        <span class="stat-icon">📌</span>
                        <span><strong>{{ getCourseModulesCount(course) }}</strong> Modules</span>
                      </div>
                      <div class="stat-pill">
                        <span class="stat-icon">🎬</span>
                        <span><strong>{{ getCourseLessonsCount(course) }}</strong> Lessons</span>
                      </div>
                    </div>

                    <!-- Action Buttons Footer -->
                    <div class="course-actions-bar">
                      <button class="btn-primary flex-1" (click)="openSyllabusDrawer(course)">
                        <span>🛠️ Manage Syllabus & Lessons</span>
                      </button>
                      <button class="btn-icon-danger" (click)="deleteCourse(course.id)" title="Delete Course">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="card-box empty-state-box" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px;">
                  <div style="font-size: 42px; margin-bottom: 12px;">📚</div>
                  <h3 style="color: #fff; margin: 0 0 8px;">No Courses Found</h3>
                  <p class="muted" style="margin: 0 0 16px;">No course matches your search query or selected level filter.</p>
                  <button class="btn-primary" (click)="courseSearchQuery = ''; selectedCourseLevelFilter = 'all'">Reset Filters</button>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 4: COURIER & BOOK ORDERS -->
        @if (currentTab === 'courier') {
          <div class="header-banner">
            <div>
              <h1>Physical Book Orders & Courier Logistics</h1>
              <p>Fulfill book orders, assign courier partners (DTDC, Blue Dart), and update AWB tracking status.</p>
            </div>
          </div>

          <!-- Loading Spinner for Courier Orders -->
          @if (isLoadingCourier && bookOrders.length === 0) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Courier Orders...</h3>
              <p class="muted" style="margin: 0;">Fetching book orders and shipping tracking details.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (bookOrders.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Student Name</th>
                      <th>Book Title</th>
                      <th>Shipping Address</th>
                      <th>Status</th>
                      <th>Courier & AWB</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of bookOrders; track order.id) {
                      <tr>
                        <td><strong>{{ order.order_number }}</strong></td>
                        <td>
                          <div>{{ order.student_name }}</div>
                          <small class="muted">{{ order.phone }}</small>
                        </td>
                        <td>{{ order.book_title }}</td>
                        <td class="address-col">{{ order.shipping_address }}</td>
                        <td>
                          <span class="status-pill" [ngClass]="order.status.toLowerCase()">
                            {{ order.status }}
                          </span>
                        </td>
                        <td>
                          @if (order.awb_number) {
                            <div>
                              <strong>{{ order.courier_partner || 'Courier' }}</strong>
                              <div>AWB: {{ order.awb_number }}</div>
                            </div>
                          } @else {
                            <span class="muted">Pending Tracking</span>
                          }
                        </td>
                        <td>
                          <button class="btn-sm" (click)="openCourierUpdate(order)">Update Courier AWB</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">📦</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Courier Orders Found</h3>
                  <p class="muted" style="margin: 0;">No book orders have been placed by students yet.</p>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 5: EXAM VALUATION & E-CERTIFICATES -->
        @if (currentTab === 'grading') {
          <div class="header-banner">
            <div>
              <h1>Student Exam Valuation & E-Certificate Generator</h1>
              <p>Evaluate PDF uploads & physical courier answer papers ("Eluthi PDF send"). Passing marks (≥60) auto-issue E-Certificates.</p>
            </div>
          </div>

          <!-- Loading Spinner for Exam Valuation -->
          @if (isLoadingGrading) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Exam Submissions...</h3>
              <p class="muted" style="margin: 0;">Fetching student PDF uploads and courier answer sheets.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (submissions.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course Exam</th>
                      <th>Submission Type</th>
                      <th>Attached PDF / Courier Info</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (sub of submissions; track sub.id) {
                      <tr>
                        <td>
                          <strong>{{ sub.student_name }}</strong>
                          <div class="muted">{{ sub.student_email }}</div>
                        </td>
                        <td>{{ sub.course_title }}</td>
                        <td>
                          <span class="badge-type" [class.courier]="sub.submission_type === 'physical_courier'">
                            {{ sub.submission_type === 'pdf_upload' ? '📄 PDF Upload' : '📦 Physical Courier' }}
                          </span>
                        </td>
                        <td>
                          @if (sub.pdf_url) {
                            <div>
                              <a [href]="sub.pdf_url" target="_blank" class="pdf-link">📄 Open Answer Sheet PDF</a>
                            </div>
                          }
                          @if (sub.courier_tracking_no) {
                            <div>
                              <strong>Courier:</strong> {{ sub.courier_name }}<br/>
                              <strong>Tracking:</strong> {{ sub.courier_tracking_no }}
                            </div>
                          }
                        </td>
                        <td>
                          @if (sub.score !== null) {
                            <strong>{{ sub.score }}/100</strong>
                          } @else {
                            <span class="muted">Not Graded</span>
                          }
                        </td>
                        <td>
                          <span class="status-pill" [ngClass]="sub.status.toLowerCase()">
                            {{ sub.status }}
                          </span>
                        </td>
                        <td>
                          <button class="btn-primary btn-sm" (click)="openGradingModal(sub)">Grade & Verify</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">📝</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Exam Submissions Found</h3>
                  <p class="muted" style="margin: 0;">No student exam papers have been submitted for valuation yet.</p>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 6: ASTROLOGY CONSULTATION APPOINTMENTS & AVAILABILITY ENGINE -->
        <div *ngIf="currentTab === 'services'">
          
          <!-- TOP MAIN HEADER BANNER -->
          <div class="header-banner flex-between" style="background:#ffffff;border:1px solid #e2e8f0;padding:20px 24px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.03);margin-bottom:20px;">
            <div>
              <h1 style="font-size:22px;margin:0 0 6px 0;color:#0f172a;display:flex;align-items:center;gap:8px;">
                <span>🔮</span> ஜோதிட ஆலோசனை முன்பதிவுகள் (Client Bookings)
              </h1>
              <p style="margin:0;color:#64748b;font-size:13px;">
                நேரடி முன்பதிவுகள் & ஜோதிடர் கிடைக்கும்/முடக்கப்பட்ட நாட்கள் (Availability).
              </p>
            </div>
            
            <div class="header-actions-group">
              <button 
                type="button" 
                class="btn-primary" 
                style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);padding:10px 18px;font-size:13px;font-weight:700;border-radius:10px;display:inline-flex;align-items:center;gap:6px;"
                (click)="openManualBookingModal()"
              >
                <span>➕</span> புதிய முன்பதிவு பதிவு (Add Booking)
              </button>
            </div>
          </div>

          <!-- CLEAN 14-DAYS 1-CLICK AVAILABILITY TOGGLE MATRIX -->
          <div class="availability-panel-card card-box" style="margin-bottom:24px;border-left:4px solid #b45309;padding:16px 20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <h3 style="font-size:16px;margin:0 0 2px 0;color:#0f172a;font-weight:800;display:flex;align-items:center;gap:6px;">
                  <span>📅</span> ஜோதிடர் கிடைக்கும் நாட்கள் & விடுப்பு மேலாண்மை
                </h3>
                <span style="font-size:12px;color:#64748b;">விடுப்பு தேதிகளை முடக்க அல்லது திறக்க நாள்காட்டியைப் பயன்படுத்தவும்.</span>
              </div>

              <!-- TOP RIGHT: CALENDAR TOGGLE BUTTON -->
              <button 
                type="button" 
                (click)="showCalendarMatrix = !showCalendarMatrix"
                style="background:linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);border:1.5px solid #cbd5e1;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:700;color:#0f172a;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:all 0.2s ease;"
              >
                <span style="font-size:15px;">🗓️</span> 
                <span>நாள்காட்டி & தேதி தேர்வு (Calendar)</span>
                <span style="font-size:11px;color:#b45309;font-weight:800;">{{ showCalendarMatrix ? '▲ மூடு (Close)' : '▼ திற (Open)' }}</span>
              </button>
            </div>

            <!-- EXPANDABLE 14 DAYS MATRIX & DATE PICKER -->
            <div *ngIf="showCalendarMatrix" style="margin-top:16px;padding-top:14px;border-top:1px dashed #cbd5e1;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
                <span style="font-size:12px;color:#64748b;font-weight:600;background:#f8fafc;padding:4px 10px;border-radius:6px;border:1px solid #e2e8f0;">
                  💡 கீழே உள்ள தேதியை ஒருமுறை தொட்டால் <strong>"🔴 Blocked"</strong> ஆகும்; மீண்டும் தொட்டால் <strong>"🟢 Free"</strong> ஆகும்.
                </span>

                <!-- Specific Date Picker Input -->
                <div style="display:flex;align-items:center;gap:6px;background:#f8fafc;padding:4px 10px;border-radius:8px;border:1px solid #cbd5e1;">
                  <label style="font-size:12px;font-weight:700;color:#334155;">குறிப்பிட்ட தேதி:</label>
                  <input 
                    type="date" 
                    [(ngModel)]="selectedCustomDate" 
                    (change)="toggleCustomDate(selectedCustomDate)"
                    style="padding:4px 8px;border:1px solid #94a3b8;border-radius:6px;font-size:12px;font-weight:700;background:#fff;cursor:pointer;"
                  />
                </div>
              </div>

              <!-- 14 Days Matrix Grid -->
              <div class="calendar-matrix-grid">
                <div 
                  *ngFor="let day of upcoming14Days" 
                  class="day-avail-card"
                  [class.busy]="day.isBlocked"
                  [class.free]="!day.isBlocked"
                  (click)="toggleAvailability(day.date, day.isBlocked ? 'available' : 'busy')"
                  [title]="day.isBlocked ? (day.date + ': Blocked - Click to make Free') : (day.date + ': Free - Click to Block')"
                >
                  <span class="day-name-tamil">{{ day.dayName }}</span>
                  <strong class="day-date-str">{{ day.date | date:'dd MMM' }}</strong>
                  <span class="day-status-tag" [class.tag-busy]="day.isBlocked" [class.tag-free]="!day.isBlocked">
                    {{ day.isBlocked ? '🔴 Blocked' : '🟢 Free' }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- BOTTOM SECTION: DYNAMIC APPOINTMENT BOOKINGS -->
          <div class="header-banner flex-between">
            <div>
              <h1 style="font-size:22px;margin:0 0 4px 0;color:#0f172a;">🔮 ஜோதிட ஆலோசனை முன்பதிவுகள் (Live Client Bookings)</h1>
              <p style="margin:0;color:#64748b;font-size:13px;">பயனர்கள் பதிவு செய்த ஜாதகக் கணிப்பு மற்றும் நேரடி ஆலோசனை முன்பதிவுகள் விவரங்கள்.</p>
            </div>
            <div class="header-actions-group">
              <button class="btn-primary" (click)="openManualBookingModal()">
                + புதிய முன்பதிவு பதிவு (Add Manual Booking)
              </button>
            </div>
          </div>

          <!-- Filter Sub-Tabs -->
          <div class="rasi-controls-bar" style="margin-bottom:14px;">
            <div class="rasi-type-bar">
              <button [class.active]="bookingFilterStatus === 'all'" (click)="bookingFilterStatus = 'all'">
                அனைத்தும் ({{ serviceBookings.length }})
              </button>
              <button [class.active]="bookingFilterStatus === 'Pending'" (click)="bookingFilterStatus = 'Pending'">
                ⏳ புதியவை / காத்திருப்பவை ({{ getBookingCount('Pending') }})
              </button>
              <button [class.active]="bookingFilterStatus === 'In-Progress'" (click)="bookingFilterStatus = 'In-Progress'">
                📞 பேசப்படுகிறது ({{ getBookingCount('In-Progress') }})
              </button>
              <button [class.active]="bookingFilterStatus === 'Completed'" (click)="bookingFilterStatus = 'Completed'">
                ✅ நிறைவடைந்தவை ({{ getBookingCount('Completed') }})
              </button>
            </div>
            <button class="btn-xs-refresh" (click)="loadAllData()" title="Refresh Bookings">
              🔄 Sync Live
            </button>
          </div>

          <!-- Empty State -->
          <div *ngIf="getFilteredBookings().length === 0" class="card-box text-center py-5">
            <p class="muted">முன்பதிவுகள் எதுவும் இல்லை.</p>
          </div>

          <!-- Bookings Table -->
          <div *ngIf="getFilteredBookings().length > 0" class="card-box">
            <table class="data-table">
              <thead>
                <tr>
                  <th>முன்பதிவு ID</th>
                  <th>பயனர் பெயர் & தொடர்பு (Client Contact)</th>
                  <th>சேவை வகை (Service Type)</th>
                  <th>கட்டணம்</th>
                  <th>பிறந்த விவரங்கள் & கேள்வி (Birth Details & Query)</th>
                  <th>நிலை (Status)</th>
                  <th>தேதி</th>
                  <th>செயல்கள்</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of getFilteredBookings()">
                  <td><strong>{{ b.id }}</strong></td>
                  <td>
                    <div style="font-weight:700;color:#0f172a;">{{ b.user_name }}</div>
                    <div class="phone-contact-row" style="margin-top:4px;display:flex;gap:6px;align-items:center;">
                      <a [href]="'tel:' + b.user_phone" class="btn-tel-call" title="Call Client">
                        📞 {{ b.user_phone }}
                      </a>
                      <a [href]="'https://wa.me/91' + b.user_phone" target="_blank" class="btn-wa-link" title="WhatsApp Message">
                        💬 WA
                      </a>
                    </div>
                  </td>
                  <td><span class="badge-role">{{ b.service_type }}</span></td>
                  <td><strong style="color:#b45309;">₹{{ b.price }}</strong></td>
                  <td>
                    <div *ngIf="b.details">
                      <div style="font-size:11px;">
                        <span class="muted">📅 பிறந்த தேதி:</span> <strong>{{ b.details.dob || 'N/A' }}</strong> 
                        <span *ngIf="b.details.tob" style="margin-left:6px;"><span class="muted">⏰ நேரம்:</span> <strong>{{ b.details.tob }}</strong></span>
                      </div>
                      <div *ngIf="b.details.pob" style="font-size:11px;">
                        <span class="muted">📍 பிறந்த இடம்:</span> <strong>{{ b.details.pob }}</strong>
                      </div>
                      <div *ngIf="b.details.preferred_date" style="font-size:11px;color:#1d4ed8;font-weight:600;">
                        🗓️ விரும்பிய தேதி: {{ b.details.preferred_date }}
                      </div>
                      <div *ngIf="b.details.query" class="muted" style="font-size:11px;margin-top:2px;">
                        ❓ கேள்வி: {{ b.details.query }}
                      </div>
                    </div>
                    <span *ngIf="!b.details" class="muted">-</span>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="b.status.toLowerCase()">
                      {{ b.status === 'Completed' ? '✅ Completed' : (b.status === 'In-Progress' ? '📞 In-Progress' : '⏳ Pending') }}
                    </span>
                  </td>
                  <td style="font-size:12px;color:#64748b;">{{ b.created_at | date:'dd MMM yyyy' }}</td>
                  <td>
                    <div style="display:flex;flex-direction:column;gap:5px;">
                      <button 
                        class="btn-sm"
                        style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:700;padding:5px 10px;font-size:11px;border-radius:6px;cursor:pointer;"
                        (click)="openViewBookingModal(b)"
                      >
                        👁️ விவரங்கள் (View)
                      </button>
                      <button 
                        class="btn-primary btn-sm"
                        style="padding:5px 10px;font-size:11px;border-radius:6px;"
                        (click)="openFulfillModal(b)"
                      >
                        ✓ நிலை / PDF
                      </button>
                      <button 
                        class="btn-sm"
                        style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-weight:700;padding:5px 10px;font-size:11px;border-radius:6px;cursor:pointer;"
                        (click)="deleteBooking(b.id, b.user_name)"
                        title="Meeting over ஆனபின் இந்த முன்பதிவை நீக்கலாம்"
                      >
                        🗑️ நீக்கு (Delete)
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BOOKING FULL DETAILS VIEW MODAL -->
          <div *ngIf="selectedBookingForView" class="modal-overlay" (click)="selectedBookingForView = null">
            <div class="modal-box" style="max-width:580px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <h3 style="margin:0;color:#0f172a;font-size:17px;">🔮 முன்பதிவு முழு விவரங்கள்</h3>
                  <span style="font-size:12px;color:#64748b;">முன்பதிவு ID: #{{ selectedBookingForView.id }} &bull; தேதி: {{ selectedBookingForView.created_at | date:'dd MMM yyyy' }}</span>
                </div>
                <button class="close-btn" (click)="selectedBookingForView = null">✕</button>
              </div>

              <!-- Contact Card -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 16px;border-radius:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                  <span style="font-size:11px;color:#15803d;font-weight:700;text-transform:uppercase;display:block;">வாடிக்கையாளர் தொடர்பு:</span>
                  <strong style="font-size:15px;color:#0f172a;">{{ selectedBookingForView.user_name }}</strong>
                  <span style="font-size:13px;color:#166534;margin-left:8px;font-weight:600;">({{ selectedBookingForView.user_phone }})</span>
                </div>
                <div style="display:flex;gap:8px;">
                  <a [href]="'tel:' + selectedBookingForView.user_phone" class="btn-primary" style="padding:7px 14px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                    📞 Call Client
                  </a>
                  <a [href]="'https://wa.me/91' + selectedBookingForView.user_phone" target="_blank" style="padding:7px 14px;font-size:12px;text-decoration:none;background:#25d366;color:#fff;font-weight:700;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              <!-- Service & Birth Details Grid -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:12px;">
                  <div><span class="muted">சேவை வகை:</span> <strong style="color:#b45309;">{{ selectedBookingForView.service_type }}</strong></div>
                  <div><span class="muted">கட்டணம்:</span> <strong style="color:#059669;">₹{{ selectedBookingForView.price }}</strong></div>
                  <div><span class="muted">பிறந்த தேதி:</span> <strong>{{ selectedBookingForView.details?.dob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                  <div><span class="muted">பிறந்த நேரம்:</span> <strong>{{ selectedBookingForView.details?.tob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                  <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ selectedBookingForView.details?.pob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                  <div><span class="muted">விரும்பிய தேதி:</span> <strong style="color:#1d4ed8;">{{ selectedBookingForView.details?.preferred_date || 'N/A' }}</strong></div>
                </div>

                <div *ngIf="selectedBookingForView.details?.query" style="background:#fff;border:1px solid #cbd5e1;padding:10px 12px;border-radius:8px;font-size:12px;">
                  <strong style="color:#334155;display:block;margin-bottom:3px;">❓ வாடிக்கையாளரின் கேள்விகள் / நோக்கம்:</strong>
                  <p style="margin:0;color:#475569;line-height:1.4;">{{ selectedBookingForView.details.query }}</p>
                </div>
              </div>

              <!-- Status & Chart Link -->
              <div style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #e2e8f0;padding:12px 16px;border-radius:10px;margin-bottom:16px;">
                <div>
                  <span class="muted" style="font-size:12px;">தற்போதைய நிலை:</span>
                  <span class="status-pill" [ngClass]="selectedBookingForView.status.toLowerCase()" style="margin-left:8px;">
                    {{ selectedBookingForView.status }}
                  </span>
                </div>
                <div *ngIf="selectedBookingForView.chart_url">
                  <a [href]="selectedBookingForView.chart_url" target="_blank" class="pdf-link" style="font-size:12px;">
                    📄 View Jathagam Chart PDF
                  </a>
                </div>
              </div>

              <!-- Action Bar -->
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f1f5f9;padding-top:14px;">
                <button 
                  type="button" 
                  style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;font-weight:700;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;"
                  (click)="deleteBooking(selectedBookingForView.id, selectedBookingForView.user_name); selectedBookingForView = null;"
                >
                  🗑️ இந்த முன்பதிவை நீக்கு (Delete)
                </button>
                <div style="display:flex;gap:8px;">
                  <button type="button" class="btn-cancel" (click)="selectedBookingForView = null">Close</button>
                  <button 
                    type="button" 
                    class="btn-primary" 
                    (click)="openFulfillModal(selectedBookingForView); selectedBookingForView = null;"
                  >
                    ✓ நிலை மாற்றம் / PDF
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- FULFILL / STATUS UPDATE MODAL -->
          <div *ngIf="selectedBookingForFulfill" class="modal-overlay" (click)="selectedBookingForFulfill = null">
            <div class="modal-box" style="max-width:500px;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3 style="margin:0;color:#0f172a;">முன்பதிவு நிலை மாற்றம் & ஜாதக PDF</h3>
                <button class="close-btn" (click)="selectedBookingForFulfill = null">✕</button>
              </div>
              <div style="margin-bottom:14px;background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;font-size:13px;">
                <div><span class="muted">பயனர்:</span> <strong>{{ selectedBookingForFulfill.user_name }}</strong> ({{ selectedBookingForFulfill.user_phone }})</div>
                <div><span class="muted">சேவை:</span> <strong>{{ selectedBookingForFulfill.service_type }}</strong> &bull; ₹{{ selectedBookingForFulfill.price }}</div>
              </div>
              <div class="form-group">
                <label>ஆலோசனை நிலை (Booking Status):</label>
                <select [(ngModel)]="fulfillForm.status" class="ctrl">
                  <option value="Pending">⏳ Pending (காத்திருப்பில்)</option>
                  <option value="In-Progress">📞 In-Progress (ஆலோசனை நடக்கிறது / பேசப்பட்டது)</option>
                  <option value="Completed">✅ Completed (முழுமையாக நிறைவடைந்தது)</option>
                  <option value="Cancelled">❌ Cancelled (ரத்து செய்யப்பட்டது)</option>
                </select>
              </div>
              <div class="form-group">
                <label>ஜாதகக் கணிப்பு PDF லிங்க் / Chart URL (Optional):</label>
                <input [(ngModel)]="fulfillForm.chart_url" class="ctrl" placeholder="https://example.com/charts/jathagam_report.pdf"/>
              </div>
              <div class="modal-btns">
                <button type="button" class="btn-cancel" (click)="selectedBookingForFulfill = null">Cancel</button>
                <button type="button" class="btn-primary" (click)="submitFulfill()">
                  💾 சேமி (Save Status)
                </button>
              </div>
            </div>
          </div>

          <!-- MANUAL BOOKING MODAL -->
          <div *ngIf="manualBookingModalOpen" class="modal-overlay" (click)="manualBookingModalOpen = false">
            <div class="modal-box" style="max-width:540px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3 style="margin:0;color:#0f172a;">+ புதிய முன்பதிவு பதிவு (Manual Booking)</h3>
                <button class="close-btn" (click)="manualBookingModalOpen = false">✕</button>
              </div>
              <form (ngSubmit)="submitManualBooking()">
                <div class="form-group">
                  <label>பயனர் பெயர் (Client Name):</label>
                  <input [(ngModel)]="manualBookingForm.user_name" name="b_name" required class="ctrl" placeholder="பெயர்"/>
                </div>
                <div class="form-group">
                  <label>தொலைபேசி எண் (Phone Number):</label>
                  <input [(ngModel)]="manualBookingForm.user_phone" name="b_phone" required class="ctrl" placeholder="9876543210"/>
                </div>
                <div class="form-group">
                  <label>சேவை வகை (Service Type):</label>
                  <select [(ngModel)]="manualBookingForm.service_type" name="b_service" class="ctrl">
                    <option value="Full Jathagam Reading & Porutham Matching">துல்லியமான ஜாதகக் கணிப்பு (Kundali Report) - ₹499</option>
                    <option value="Marriage Matchmaking Consultation">திருமணப் பொருத்தம் கணித்தல் - ₹299</option>
                    <option value="Live Astrologer Phone Consultation">ஜோதிடர்களுடன் நேரடி ஆலோசனை - ₹999</option>
                    <option value="Numerology & Lucky Name Consultation">நியூமராலஜி & பெயர் அதிர்ஷ்டம் - ₹399</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>கட்டணம் (Price ₹):</label>
                  <input type="number" [(ngModel)]="manualBookingForm.price" name="b_price" class="ctrl"/>
                </div>
                <div class="form-group">
                  <label>விரும்பிய ஆலோசனை தேதி (Preferred Date):</label>
                  <input type="date" [(ngModel)]="manualBookingForm.booking_date" name="b_prefdate" class="ctrl"/>
                </div>
                <div class="form-group">
                  <label>பிறந்த விவரங்கள் (DOB, Time, Place):</label>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                    <input type="date" [(ngModel)]="manualBookingForm.dob" name="b_dob" placeholder="DOB" class="ctrl"/>
                    <input [(ngModel)]="manualBookingForm.tob" name="b_tob" placeholder="நேரம் (08:30 AM)" class="ctrl"/>
                    <input [(ngModel)]="manualBookingForm.pob" name="b_pob" placeholder="இடம் (சென்னை)" class="ctrl"/>
                  </div>
                </div>
                <div class="form-group">
                  <label>கேள்விகள் / குறிப்பு (Client Query):</label>
                  <textarea [(ngModel)]="manualBookingForm.query" name="b_query" class="ctrl" rows="2" placeholder="வாடிக்கையாளரின் கேள்விகள்..."></textarea>
                </div>
                <div class="modal-btns">
                  <button type="button" class="btn-cancel" (click)="manualBookingModalOpen = false">Cancel</button>
                  <button type="submit" class="btn-primary">பதிவு செய் (Submit Booking)</button>
                </div>
              </form>
            </div>
          </div>

        </div>

        <!-- TAB 7: RASI PALAN EDITOR -->
        @if (currentTab === 'rasi-editor') {
          <div class="header-banner flex-between">
            <div>
              <h1>🌟 Rasi Palan Management Engine</h1>
              <p>Dynamic live synchronization for all 12 Rasis. Any changes published here reflect immediately on the user side /zodiac page and mobile app.</p>
            </div>
            <div class="header-actions-group">
              <button class="btn-secondary-ed" (click)="resetAllToDefaults()" title="Reset to standard defaults">
                🔄 Reset All Defaults
              </button>
              <button class="btn-primary" (click)="publishRasiPalan()" [disabled]="rasiPublishing">
                <span *ngIf="rasiPublishing">⏳ Publishing...</span>
                <span *ngIf="!rasiPublishing">📢 Publish All Predictions</span>
              </button>
            </div>
          </div>

          <!-- Notification Toast / Alert -->
          <div *ngIf="rasiSaveSuccessMsg" class="alert-success-banner">
            {{ rasiSaveSuccessMsg }}
          </div>

          <!-- Tab Type & Date Selector Bar -->
          <div class="rasi-controls-bar">
            <div class="rasi-type-bar">
              <button 
                *ngFor="let t of rasiTypes" 
                [class.active]="rasiEditorType === t.val" 
                (click)="changeRasiType(t.val)">
                {{ t.label }} ({{ t.tamilLabel }})
              </button>
            </div>

            <div class="rasi-date-filter">
              <label>📅 Target Date:</label>
              <input 
                type="date" 
                [(ngModel)]="selectedRasiDate" 
                (change)="loadRasiPredictions()" 
                class="date-input-ctrl"
              />
              <button class="btn-xs-refresh" (click)="loadRasiPredictions()" title="Refresh from Database">
                🔄 Sync
              </button>
            </div>
          </div>

          <!-- 12 COMPACT RASI CARDS GRID (ICON & NAME ONLY - INSTANT DISPLAY) -->
          <div class="rasi-compact-grid">
            <div 
              *ngFor="let r of rasiEditorList; let i = index" 
              class="rasi-compact-card"
              (click)="openRasiModal(i)"
              [title]="r.name + ' பலனை திருத்த கிளிக் செய்க (Click to Edit)'"
            >
              <div class="rasi-icon-circle">
                <span>{{ r.symbol }}</span>
              </div>
              <div class="rasi-compact-meta">
                <strong class="rasi-compact-tamil">{{ r.name }}</strong>
                <span class="rasi-compact-eng">{{ r.englishName }} &bull; {{ r.dates }}</span>
                <div class="rasi-compact-badges">
                  <span class="badge-mini has-text" *ngIf="rasiPredictions[i]?.prediction_text">✓ பலன் தயார்</span>
                  <span class="badge-mini has-audio" *ngIf="rasiPredictions[i]?.audio_url">🎙️ Audio</span>
                  <span class="badge-mini has-video" *ngIf="rasiPredictions[i]?.video_url">🎬 Video</span>
                </div>
              </div>
              <div class="rasi-card-edit-btn" title="Edit Rasi Palan">
                <span>✏️</span>
              </div>
            </div>
          </div>

          <!-- RASI PALAN EDIT POPUP MODAL (ராசியை தொட்டவுடன் தோன்றும் விண்டோ) -->
          <div *ngIf="selectedRasiIndex !== null" class="modal-overlay" (click)="closeRasiModal()">
            <div class="modal-box rasi-edit-modal-box" style="max-width:560px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              
              <!-- Modal Header -->
              <div class="modal-header" style="border-bottom:1px solid #f1f5f9;padding-bottom:12px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div class="rasi-icon-circle" style="width:44px;height:44px;font-size:24px;">
                    <span>{{ rasiEditorList[selectedRasiIndex].symbol }}</span>
                  </div>
                  <div>
                    <h3 style="margin:0;color:#b45309;font-size:18px;font-weight:800;">
                      {{ rasiEditorList[selectedRasiIndex].name }} ({{ rasiEditorList[selectedRasiIndex].englishName }})
                    </h3>
                    <span style="font-size:12px;color:#64748b;font-weight:500;">
                      {{ rasiEditorType | titlecase }} பலன் &bull; தேதி: {{ selectedRasiDate | date:'dd MMM yyyy' }}
                    </span>
                  </div>
                </div>
                <button class="close-btn" (click)="closeRasiModal()">✕</button>
              </div>

              <!-- Modal Body -->
              <div style="margin:16px 0;display:flex;flex-direction:column;gap:14px;">
                
                <!-- Prediction Textarea -->
                <div class="form-group" style="margin:0;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <label style="font-weight:700;color:#334155;font-size:13px;">
                      {{ rasiEditorList[selectedRasiIndex].name }} பலன் (Prediction Text):
                    </label>
                    <span style="font-size:11px;color:#2563eb;font-weight:600;">
                      {{ (rasiPredictions[selectedRasiIndex]?.prediction_text || '').length }} chars
                    </span>
                  </div>
                  <textarea
                    [(ngModel)]="rasiPredictions[selectedRasiIndex].prediction_text"
                    class="ctrl"
                    rows="5"
                    style="line-height:1.5;resize:vertical;"
                    [placeholder]="rasiEditorList[selectedRasiIndex].name + ' ராசிக்கான பலன் உள்ளிடவும்...'"
                  ></textarea>
                </div>

                <!-- Audio URL -->
                <div class="media-input-box audio-box">
                  <label class="media-lbl">
                    <span class="media-icon">🎙️</span> 
                    <strong>ஆடியோ பலன் (Audio Stream URL - Optional):</strong>
                  </label>
                  <div class="media-input-row">
                    <input 
                      [(ngModel)]="rasiPredictions[selectedRasiIndex].audio_url" 
                      class="ctrl-sm" 
                      placeholder="https://example.com/audio/mesham.mp3"
                    />
                    <button 
                      *ngIf="rasiPredictions[selectedRasiIndex].audio_url" 
                      type="button"
                      class="btn-audio-test" 
                      (click)="testPlayAudio(rasiPredictions[selectedRasiIndex].audio_url)"
                      title="Play Audio">
                      ▶ Play
                    </button>
                  </div>
                </div>

                <!-- Video URL -->
                <div class="media-input-box video-box">
                  <label class="media-lbl video-lbl">
                    <span class="media-icon">🎬</span> 
                    <strong>வீடியோ பலன் (Video URL / YouTube - Optional):</strong>
                  </label>
                  <div class="media-input-row">
                    <input 
                      [(ngModel)]="rasiPredictions[selectedRasiIndex].video_url" 
                      class="ctrl-sm" 
                      placeholder="https://www.youtube.com/watch?v=... அல்லது MP4 வீடியோ லிங்க்"
                    />
                    <button 
                      *ngIf="rasiPredictions[selectedRasiIndex].video_url" 
                      type="button"
                      class="btn-video-test" 
                      (click)="openVideoPreview(rasiPredictions[selectedRasiIndex].video_url, rasiEditorList[selectedRasiIndex].name)"
                      title="Preview Video">
                      👁️ Preview
                    </button>
                  </div>
                  <span class="video-hint-text">💡 YouTube / MP4 வீடியோ சேர்த்தால் User Side (/zodiac)-ல் வீடியோ பிளேயர் தோன்றும்.</span>
                </div>

                <!-- Footer Quick Actions inside Modal -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;">
                  <button type="button" class="btn-link-reset" (click)="resetSingleRasi(selectedRasiIndex)">
                    ↺ Reset Default
                  </button>
                  <span class="status-dot-live">● Live Sync Ready</span>
                </div>

              </div>

              <!-- Modal Footer -->
              <div class="modal-btns" style="border-top:1px solid #f1f5f9;padding-top:14px;margin-top:10px;">
                <button type="button" class="btn-cancel" (click)="closeRasiModal()">Cancel</button>
                <button 
                  type="button" 
                  class="btn-primary" 
                  style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);"
                  (click)="saveSingleRasi(selectedRasiIndex); closeRasiModal();"
                >
                  💾 இந்த ராசி பலனை சேமி (Save)
                </button>
              </div>

            </div>
          </div>
        }

        <!-- TAB 8: PORUTHAM & MATRIMONY -->
        <div *ngIf="currentTab === 'matches'">
          
          <!-- TOP 2 CLEAN TOGGLE BUTTONS -->
          <div style="background:#ffffff;border:1px solid #e2e8f0;padding:16px 20px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.03);margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
            <div>
              <h2 style="font-size:20px;margin:0 0 4px 0;color:#0f172a;font-weight:800;">
                {{ matchFilterType === 'pair_match' ? '💑 திருமணப் பொருத்தம் (Porutham)' : '👰 வரன் தேடல் & மேட்ரிமோனி (Matrimony)' }}
              </h2>
              <span style="font-size:12px;color:#64748b;">
                {{ matchFilterType === 'pair_match' ? 'பயனர் அனுப்பிய 2 ஜாதகங்களை ஆய்வு செய்து இறுதி முடிவு வழங்கும் பகுதி.' : 'பயனரின் விவரங்களை பார்த்து பொருத்தமான வரன் பரிந்துரைக்கும் பகுதி.' }}
              </span>
            </div>

            <!-- 2 TABS -->
            <div style="display:flex;gap:10px;">
              <button 
                type="button"
                (click)="matchFilterType = 'pair_match'"
                [style.background]="matchFilterType === 'pair_match' ? '#2563eb' : '#f1f5f9'"
                [style.color]="matchFilterType === 'pair_match' ? '#ffffff' : '#334155'"
                style="border:none;padding:10px 20px;font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;"
              >
                <span>💑</span>
                <span>பொருத்தம் (Porutham)</span>
                <span style="background:rgba(0,0,0,0.15);padding:1px 6px;border-radius:12px;font-size:11px;">{{ getMatchCount('pair_match') }}</span>
              </button>

              <button 
                type="button"
                (click)="matchFilterType = 'single_search'"
                [style.background]="matchFilterType === 'single_search' ? '#9333ea' : '#f1f5f9'"
                [style.color]="matchFilterType === 'single_search' ? '#ffffff' : '#334155'"
                style="border:none;padding:10px 20px;font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;"
              >
                <span>👰</span>
                <span>மேட்ரிமோனி (Matrimony)</span>
                <span style="background:rgba(0,0,0,0.15);padding:1px 6px;border-radius:12px;font-size:11px;">{{ getMatchCount('single_search') }}</span>
              </button>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 1. PORUTHAM (இருவர் ஜாதகப் பொருத்தம்) -->
          <!-- ============================================== -->
          <div *ngIf="matchFilterType === 'pair_match'">
            
            <div *ngIf="getFilteredMatches().length === 0" class="card-box text-center" style="padding:40px;">
              <p class="muted" style="margin:0;font-size:14px;">எந்த இருவர் ஜாதகப் பொருத்தம் கோரிக்கைகளும் வரவில்லை.</p>
            </div>

            <div *ngIf="getFilteredMatches().length > 0" style="display:flex;flex-direction:column;gap:16px;">
              <div *ngFor="let m of getFilteredMatches()" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                
                <!-- Card Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f1f5f9;padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:12px;font-weight:800;background:#eff6ff;color:#2563eb;padding:3px 8px;border-radius:6px;">#{{ m.id }}</span>
                    <div>
                      <strong style="color:#0f172a;font-size:14px;">{{ m.requester_display || m.requester_name || 'பயனர்' }}</strong>
                      <span *ngIf="m.contact_phone || m.requester_phone" style="font-size:13px;color:#166534;font-weight:600;margin-left:8px;">
                        ({{ m.contact_phone || m.requester_phone }})
                      </span>
                    </div>
                  </div>

                  <div style="display:flex;gap:8px;align-items:center;">
                    <a *ngIf="m.contact_phone || m.requester_phone" [href]="'tel:' + (m.contact_phone || m.requester_phone)" class="btn-primary" style="padding:5px 12px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                      📞 Call
                    </a>
                    <a *ngIf="m.contact_phone || m.requester_phone" [href]="'https://wa.me/91' + (m.contact_phone || m.requester_phone)" target="_blank" style="padding:5px 12px;font-size:12px;text-decoration:none;background:#25d366;color:#fff;font-weight:700;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                      💬 WhatsApp
                    </a>
                    <span style="font-size:11px;color:#94a3b8;margin-left:6px;">{{ m.created_at | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>

                <!-- 2 Jathagams Grid (Boy vs Girl) -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                  
                  <!-- Boy Details -->
                  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;">
                    <strong style="color:#1d4ed8;font-size:13px;display:block;margin-bottom:6px;">👦 மணமகன் விவரங்கள் (Boy):</strong>
                    <div style="font-size:12px;color:#334155;display:flex;flex-direction:column;gap:3px;">
                      <div><span class="muted">பெயர்:</span> <strong>{{ m.boy_name || '-' }}</strong></div>
                      <div><span class="muted">பிறந்த தேதி & நேரம்:</span> <strong>{{ m.boy_dob | date:'dd MMM yyyy' }} • {{ m.boy_tob || '-' }}</strong></div>
                      <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ m.boy_pob || '-' }}</strong></div>
                      <div><span class="muted">ராசி & நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ m.boy_rasi || '-' }} | {{ m.boy_nakshatra || '-' }}</strong></div>
                    </div>
                  </div>

                  <!-- Girl Details -->
                  <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:10px;padding:12px;">
                    <strong style="color:#be185d;font-size:13px;display:block;margin-bottom:6px;">👧 மணமகள் விவரங்கள் (Girl):</strong>
                    <div style="font-size:12px;color:#334155;display:flex;flex-direction:column;gap:3px;">
                      <div><span class="muted">பெயர்:</span> <strong>{{ m.girl_name || '-' }}</strong></div>
                      <div><span class="muted">பிறந்த தேதி & நேரம்:</span> <strong>{{ m.girl_dob | date:'dd MMM yyyy' }} • {{ m.girl_tob || '-' }}</strong></div>
                      <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ m.girl_pob || '-' }}</strong></div>
                      <div><span class="muted">ராசி & நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ m.girl_rasi || '-' }} | {{ m.girl_nakshatra || '-' }}</strong></div>
                    </div>
                  </div>

                </div>

                <!-- Admin Final Decision Box -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                  <div style="flex:1;min-width:260px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                      <span style="font-size:12px;font-weight:700;color:#0f172a;">🔮 ஜோதிடரின் முடிவு:</span>
                      <span class="status-pill" 
                        [class.completed]="m.admin_status === 'Completed' || m.admin_status === 'Good Match' || m.admin_status === 'Excellent Match'"
                        [class.processing]="m.admin_status === 'Average Match' || m.admin_status === 'Contacted'"
                        [class.pending]="!m.admin_status || m.admin_status === 'Pending'">
                        {{ getPoruthamDecisionLabel(m.admin_status) }}
                      </span>
                    </div>
                    <p style="margin:0;font-size:12px;color:#475569;" *ngIf="m.admin_notes">
                      <strong>குறிப்பு:</strong> {{ m.admin_notes }}
                    </p>
                    <span style="font-size:11px;color:#94a3b8;" *ngIf="!m.admin_notes">இன்னும் முடிவு உள்ளிடப்படவில்லை.</span>
                  </div>

                  <div style="display:flex;gap:8px;">
                    <button 
                      class="btn-primary" 
                      style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);padding:7px 14px;font-size:12px;font-weight:700;"
                      (click)="viewMatchDetails(m)"
                    >
                      ✏️ முடிவு எழுத (Give Decision)
                    </button>
                    <button 
                      class="btn-sm" 
                      style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;font-weight:700;padding:7px 12px;font-size:12px;border-radius:8px;cursor:pointer;"
                      (click)="deleteMatchRecord(m.id, (m.boy_name + ' & ' + m.girl_name))"
                    >
                      🗑️ நீக்கு
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- ============================================== -->
          <!-- 2. MATRIMONY (வரன் தேடல்) -->
          <!-- ============================================== -->
          <div *ngIf="matchFilterType === 'single_search'">
            
            <div *ngIf="getFilteredMatches().length === 0" class="card-box text-center" style="padding:40px;">
              <p class="muted" style="margin:0;font-size:14px;">எந்த வரன் தேடல் கோரிக்கைகளும் வரவில்லை.</p>
            </div>

            <div *ngIf="getFilteredMatches().length > 0" style="display:flex;flex-direction:column;gap:16px;">
              <div *ngFor="let m of getFilteredMatches()" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                
                <!-- Card Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f1f5f9;padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:12px;font-weight:800;background:#fdf4ff;color:#9333ea;padding:3px 8px;border-radius:6px;">#{{ m.id }}</span>
                    <div>
                      <strong style="color:#0f172a;font-size:14px;">{{ m.requester_display || m.requester_name || 'பயனர்' }}</strong>
                      <span *ngIf="m.contact_phone || m.requester_phone" style="font-size:13px;color:#166534;font-weight:600;margin-left:8px;">
                        ({{ m.contact_phone || m.requester_phone }})
                      </span>
                    </div>
                  </div>

                  <div style="display:flex;gap:8px;align-items:center;">
                    <a *ngIf="m.contact_phone || m.requester_phone" [href]="'tel:' + (m.contact_phone || m.requester_phone)" class="btn-primary" style="padding:5px 12px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                      📞 Call
                    </a>
                    <a *ngIf="m.contact_phone || m.requester_phone" [href]="'https://wa.me/91' + (m.contact_phone || m.requester_phone)" target="_blank" style="padding:5px 12px;font-size:12px;text-decoration:none;background:#25d366;color:#fff;font-weight:700;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                      💬 WhatsApp
                    </a>
                    <span style="font-size:11px;color:#94a3b8;margin-left:6px;">{{ m.created_at | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>

                <!-- Single User Details & Expectations Grid -->
                <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-bottom:14px;">
                  
                  <!-- Candidate Details -->
                  <div style="background:#fdf4ff;border:1px solid #f5d0fe;border-radius:10px;padding:12px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                      <span style="font-size:10px;font-weight:800;background:#9333ea;color:#fff;padding:2px 6px;border-radius:4px;">
                        {{ m.candidate_gender === 'groom' ? '🤵 மணமகன் தேவை (Seeking Groom)' : '👰 மணமகள் தேவை (Seeking Bride)' }}
                      </span>
                      <strong style="color:#0f172a;font-size:14px;">{{ m.boy_name || m.girl_name || '-' }}</strong>
                    </div>
                    <div style="font-size:12px;color:#334155;display:flex;flex-direction:column;gap:3px;">
                      <div><span class="muted">பிறந்த தேதி & நேரம்:</span> <strong>{{ (m.boy_dob || m.girl_dob) | date:'dd MMM yyyy' }} • {{ m.boy_tob || m.girl_tob || '-' }}</strong></div>
                      <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ m.boy_pob || m.girl_pob || '-' }}</strong></div>
                      <div><span class="muted">ராசி & நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ m.boy_rasi || m.girl_rasi || '-' }} | {{ m.boy_nakshatra || m.girl_nakshatra || '-' }}</strong></div>
                      <div *ngIf="m.education_job"><span class="muted">படிப்பு & தொழில்:</span> <strong>{{ m.education_job }}</strong></div>
                    </div>
                  </div>

                  <!-- User Expectations -->
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
                    <strong style="color:#7e22ce;font-size:13px;display:block;margin-bottom:6px;">🎯 பயனரின் எதிர்பார்ப்புகள் (Preferences):</strong>
                    <p style="margin:0;font-size:12px;color:#334155;line-height:1.4;">
                      {{ m.preferences || 'குறிப்பிட்ட எதிர்பார்ப்புகள் ஏதுமில்லை.' }}
                    </p>
                  </div>

                </div>

                <!-- Astrologer Matrimony Response Box -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                  <div style="flex:1;min-width:260px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                      <span style="font-size:12px;font-weight:700;color:#0f172a;">💬 ஜோதிடர் வரன் பரிந்துரை நிலை:</span>
                      <span class="status-pill" 
                        [class.completed]="m.admin_status === 'Completed' || m.admin_status === 'Match Finalized'"
                        [class.processing]="m.admin_status === 'Matches Suggested' || m.admin_status === 'Contacted'"
                        [class.pending]="!m.admin_status || m.admin_status === 'Pending'">
                        {{ getMatrimonyStatusLabel(m.admin_status) }}
                      </span>
                    </div>
                    <p style="margin:0;font-size:12px;color:#475569;" *ngIf="m.admin_notes">
                      <strong>பரிந்துரைத்த வரன் விவரங்கள்:</strong> {{ m.admin_notes }}
                    </p>
                    <span style="font-size:11px;color:#94a3b8;" *ngIf="!m.admin_notes">பொருத்தமான வரன் ஆய்வு செய்யப்படுகிறது.</span>
                  </div>

                  <div style="display:flex;gap:8px;">
                    <button 
                      class="btn-primary" 
                      style="background:linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);padding:7px 14px;font-size:12px;font-weight:700;"
                      (click)="viewMatchDetails(m)"
                    >
                      ✏️ வரன் பரிந்துரைக்க (Suggest Match)
                    </button>
                    <button 
                      class="btn-sm" 
                      style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;font-weight:700;padding:7px 12px;font-size:12px;border-radius:8px;cursor:pointer;"
                      (click)="deleteMatchRecord(m.id, (m.boy_name || m.girl_name || 'Candidate'))"
                    >
                      🗑️ நீக்கு
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- MODAL 1: PORUTHAM FINAL DECISION MODAL -->
          <div *ngIf="selectedMatch && selectedMatch.request_type !== 'single_search'" class="modal-overlay" (click)="selectedMatch = null">
            <div class="modal-box" style="max-width:580px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <h3 style="margin:0;color:#0f172a;font-size:18px;">💑 இருவர் ஜாதகப் பொருத்தம் - தலைமை முடிவு</h3>
                  <span style="font-size:12px;color:#64748b;">கோரிக்கை #{{ selectedMatch.id }} &bull; {{ selectedMatch.boy_name }} & {{ selectedMatch.girl_name }}</span>
                </div>
                <button class="close-btn" (click)="selectedMatch = null">✕</button>
              </div>

              <!-- Contact Bar -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 14px;border-radius:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong style="font-size:13px;color:#0f172a;">{{ selectedMatch.requester_display || selectedMatch.requester_name }}</strong>
                  <span style="font-size:12px;color:#166534;margin-left:6px;">({{ selectedMatch.contact_phone || selectedMatch.requester_phone }})</span>
                </div>
                <div style="display:flex;gap:6px;">
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'tel:' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" class="btn-primary" style="padding:5px 10px;font-size:11px;text-decoration:none;">📞 Call</a>
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'https://wa.me/91' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" target="_blank" style="padding:5px 10px;font-size:11px;text-decoration:none;background:#25d366;color:#fff;border-radius:6px;">💬 WhatsApp</a>
                </div>
              </div>

              <!-- Form -->
              <div class="form-group">
                <label>ஜோதிடரின் இறுதி முடிவு (Final Decision):</label>
                <select [(ngModel)]="selectedMatch.admin_status" class="ctrl">
                  <option value="Good Match">🟢 நல்ல பொருத்தம் (Good Match - திருமணம் செய்யலாம்)</option>
                  <option value="Excellent Match">🟢 மிகவும் நல்ல பொருத்தம் (Excellent Match)</option>
                  <option value="Average Match">🟡 சுமாரான பொருத்தம் (Average Match - பரிகாரம் தேவை)</option>
                  <option value="Not Recommended">🔴 பொருத்தம் இல்லை (Not Recommended / தோஷ முரண்பாடு)</option>
                  <option value="Pending">⏳ காத்திருப்பில் (Pending)</option>
                </select>
              </div>

              <div class="form-group">
                <label>ஜோதிடரின் விரிவான கருத்துரை / பலன் குறிப்பு:</label>
                <textarea 
                  [(ngModel)]="selectedMatch.admin_notes" 
                  class="ctrl" 
                  rows="4" 
                  placeholder="ரஜ்ஜு பொருத்தம், தோஷங்கள் மற்றும் திருமணத்திற்கு தலைமை ஜோதிடரின் முடிவை இங்கு உள்ளிடவும்..."
                ></textarea>
              </div>

              <div class="modal-btns" style="border-top:1px solid #f1f5f9;padding-top:14px;display:flex;justify-content:space-between;">
                <button type="button" style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;" (click)="deleteMatchRecord(selectedMatch.id, (selectedMatch.boy_name + ' & ' + selectedMatch.girl_name))">
                  🗑️ நீக்கு
                </button>
                <div style="display:flex;gap:8px;">
                  <button type="button" class="btn-cancel" (click)="selectedMatch = null">Close</button>
                  <button type="button" class="btn-primary" (click)="saveMatchConsultationNotes()">
                    💾 இறுதி முடிவை சேமி
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- MODAL 2: MATRIMONY SUGGESTION MODAL -->
          <div *ngIf="selectedMatch && selectedMatch.request_type === 'single_search'" class="modal-overlay" (click)="selectedMatch = null">
            <div class="modal-box" style="max-width:580px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <h3 style="margin:0;color:#0f172a;font-size:18px;">👰 வரன் தேடல் - ஜோதிடர் பரிந்துரை</h3>
                  <span style="font-size:12px;color:#64748b;">கோரிக்கை #{{ selectedMatch.id }} &bull; {{ selectedMatch.boy_name || selectedMatch.girl_name }}</span>
                </div>
                <button class="close-btn" (click)="selectedMatch = null">✕</button>
              </div>

              <!-- Contact Bar -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 14px;border-radius:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong style="font-size:13px;color:#0f172a;">{{ selectedMatch.requester_display || selectedMatch.requester_name }}</strong>
                  <span style="font-size:12px;color:#166534;margin-left:6px;">({{ selectedMatch.contact_phone || selectedMatch.requester_phone }})</span>
                </div>
                <div style="display:flex;gap:6px;">
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'tel:' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" class="btn-primary" style="padding:5px 10px;font-size:11px;text-decoration:none;">📞 Call</a>
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'https://wa.me/91' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" target="_blank" style="padding:5px 10px;font-size:11px;text-decoration:none;background:#25d366;color:#fff;border-radius:6px;">💬 WhatsApp</a>
                </div>
              </div>

              <!-- Form -->
              <div class="form-group">
                <label>வரன் பரிந்துரை நிலை (Matrimony Status):</label>
                <select [(ngModel)]="selectedMatch.admin_status" class="ctrl">
                  <option value="Matches Suggested">📞 பொருத்தமான வரன் போனில் தெரிவிக்கப்பட்டது (Suggested on Call)</option>
                  <option value="Searching">🔍 பொருத்தமான வரன் தேடப்படுகிறது (Searching)</option>
                  <option value="Match Finalized">✅ வரன் முடிந்தது / திருமணம் நிச்சயமானது (Finalized)</option>
                  <option value="Pending">⏳ புதிய பதிவு - ஆய்வு செய்யப்படுகிறது (Pending)</option>
                </select>
              </div>

              <div class="form-group">
                <label>பயனருக்கு பரிந்துரைத்த வரன் விவரங்கள் / குறிப்பு:</label>
                <textarea 
                  [(ngModel)]="selectedMatch.admin_notes" 
                  class="ctrl" 
                  rows="4" 
                  placeholder="பயனரின் எதிர்பார்ப்பிற்கு ஏற்ப நாம் தேர்வு செய்துள்ள வரன்களின் பெயர், ராசி, நட்சத்திரம், தொழில் மற்றும் போனில் பேசிய விவரங்களை இங்கு உள்ளிடவும்..."
                ></textarea>
              </div>

              <div class="modal-btns" style="border-top:1px solid #f1f5f9;padding-top:14px;display:flex;justify-content:space-between;">
                <button type="button" style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;" (click)="deleteMatchRecord(selectedMatch.id, (selectedMatch.boy_name || selectedMatch.girl_name || 'Candidate'))">
                  🗑️ நீக்கு
                </button>
                <div style="display:flex;gap:8px;">
                  <button type="button" class="btn-cancel" (click)="selectedMatch = null">Close</button>
                  <button type="button" class="btn-primary" style="background:linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);" (click)="saveMatchConsultationNotes()">
                    💾 குறிப்புகளை சேமி
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- TAB 9: PAYMENT TRANSACTIONS LEDGER -->
        @if (currentTab === 'payments') {
          <div class="header-banner">
            <div>
              <h1>💳 Payment Transaction Ledger</h1>
              <p>Full Razorpay payment history for all users — bookings, courses, and book purchases.</p>
            </div>
          </div>

          <!-- Loading Spinner for Payments -->
          @if (isLoadingPayments) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Payment Ledger...</h3>
              <p class="muted" style="margin: 0;">Fetching Razorpay transaction logs.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (paymentTransactions.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Txn ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Razorpay ID</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of paymentTransactions; track p.id) {
                      <tr>
                        <td><strong>#{{ p.id }}</strong></td>
                        <td>
                          <strong>{{ p.user_name }}</strong>
                          <div class="muted">{{ p.user_email }}</div>
                        </td>
                        <td><span class="badge-role">{{ p.order_type }}</span></td>
                        <td>{{ p.description || 'Payment' }}</td>
                        <td><strong>₹{{ p.amount }}</strong></td>
                        <td class="muted" style="font-size:11px;font-family:monospace">{{ p.razorpay_payment_id || '—' }}</td>
                        <td>
                          <span class="status-pill" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span>
                        </td>
                        <td>{{ p.created_at | date:'dd MMM yyyy' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">💳</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Payment Transactions Found</h3>
                  <p class="muted" style="margin: 0;">No completed payment transactions recorded yet.</p>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 10: NOTIFICATION BROADCAST -->
        @if (currentTab === 'broadcast') {
          <div class="header-banner">
            <div>
              <h1>📢 Broadcast Notifications</h1>
              <p>Send push notifications to all users or a specific user. Appears in their in-app notification center.</p>
            </div>
          </div>

          <div class="analytics-row">
            <div class="card-box">
              <h3>Send Notification</h3>
              <form (ngSubmit)="sendBroadcast()">
                <div class="form-group">
                  <label>Target Audience</label>
                  <select [(ngModel)]="broadcastForm.target" name="btarget" class="ctrl">
                    <option value="all">📣 All Users (Broadcast)</option>
                    <option value="specific">👤 Specific User</option>
                  </select>
                </div>
                @if (broadcastForm.target === 'specific') {
                  <div class="form-group">
                    <label>User ID</label>
                    <input type="number" [(ngModel)]="broadcastForm.user_id" name="buid" class="ctrl" placeholder="e.g. 2"/>
                  </div>
                }
                <div class="form-group">
                  <label>Notification Type</label>
                  <select [(ngModel)]="broadcastForm.type" name="btype" class="ctrl">
                    <option value="general">🔔 General Announcement</option>
                    <option value="rasi_palan">🌟 Rasi Palan Published</option>
                    <option value="booking_confirmed">✅ Booking Confirmed</option>
                    <option value="booking_fulfilled">🎉 Chart / Reading Ready</option>
                    <option value="certificate">🏆 E-Certificate Issued</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Title *</label>
                  <input [(ngModel)]="broadcastForm.title" name="btitle" required class="ctrl" placeholder="Notification Title"/>
                </div>
                <div class="form-group">
                  <label>Message Body *</label>
                  <textarea [(ngModel)]="broadcastForm.body" name="bbody" required class="ctrl" rows="4" placeholder="Notification message for users..."></textarea>
                </div>
                <div class="modal-btns" style="justify-content:flex-start">
                  <button type="submit" class="btn-primary">📤 Send Notification</button>
                </div>
                @if (broadcastMsg) {
                  <p class="success-msg">{{ broadcastMsg }}</p>
                }
              </form>
            </div>

            <div class="card-box">
              <h3>Platform User Stats</h3>
              <div class="ledger-row">
                <span>👥 Total Registered Users</span>
                <strong>{{ metrics?.total_students || 0 }}</strong>
              </div>
              <div class="ledger-row">
                <span>📢 Notifications Today</span>
                <strong>{{ notificationsToday || 0 }}</strong>
              </div>
              <div class="ledger-row">
                <span>💑 Marriage Match Requests</span>
                <strong>{{ marriageMatches.length || 0 }}</strong>
              </div>
              <div class="ledger-row">
                <span>💳 Total Transactions</span>
                <strong>{{ paymentTransactions.length || 0 }}</strong>
              </div>
            </div>
          </div>

          <!-- Daily Rasi Palan Auto-Notification Toggle -->
          <div class="card-box" style="margin-top: 24px; border: 1px solid rgba(212,175,55,0.3);">
            <h3>🌟 Daily Rasi Palan Auto-Notification</h3>
            <p style="font-size:12px;color:#8a8ab0;margin:0 0 16px">Automatically send today's rasi palan predictions to all opted-in users every morning at 6:00 AM IST.</p>
            <div class="ledger-row">
              <span>📧 Auto-Notification Feature</span>
              <button
                class="btn-sm"
                [class.danger]="dailyNotifEnabled"
                (click)="toggleDailyNotification()"
                [disabled]="dailyNotifLoading"
              >
                {{ dailyNotifLoading ? 'Updating...' : (dailyNotifEnabled ? '🟢 Enabled — Click to Disable' : '🔴 Disabled — Click to Enable') }}
              </button>
            </div>
            <div class="ledger-row">
              <span>👥 Opted-in Users</span>
              <strong>{{ dailyNotifOptedInCount }}</strong>
            </div>
          </div>
        }

      </main>

      <!-- MODAL: ADD ADMIN ACCOUNT -->
      @if (openAddAdminModal) {
        <div class="modal-overlay">
          <div class="modal-box-pro">
            <div class="modal-header-pro">
              <div>
                <h3>🛡️ Create Admin / Astrologer Account</h3>
                <p class="modal-sub">Grant management & system administrative access to team members.</p>
              </div>
              <button class="close-btn-pro" (click)="openAddAdminModal = false">✕</button>
            </div>

            @if (addAdminError) {
              <div class="modal-alert-error">
                ⚠️ {{ addAdminError }}
              </div>
            }

            <form (ngSubmit)="createAdmin()">
              <div class="form-grid-2">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" [(ngModel)]="newAdmin.name" name="name" required placeholder="Full Name" class="ctrl"/>
                </div>
                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" [(ngModel)]="newAdmin.email" name="email" required placeholder="admin@example.com" class="ctrl"/>
                </div>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label>Password *</label>
                  <input type="password" [(ngModel)]="newAdmin.password" name="password" required placeholder="••••••••" class="ctrl"/>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" [(ngModel)]="newAdmin.phone" name="phone" placeholder="Phone Number" class="ctrl"/>
                </div>
              </div>

              <div class="modal-btns-pro">
                <button type="button" class="btn-cancel-pro" (click)="openAddAdminModal = false">Cancel</button>
                <button type="submit" [disabled]="createAdminLoading" class="btn-primary">
                  @if (!createAdminLoading) {
                    <span>✨ Create Account</span>
                  } @else {
                    <span>Creating...</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: CREATE COURSE (ULTRA PROFESSIONAL) -->
      @if (openCourseModal) {
        <div class="modal-overlay">
          <div class="modal-box-pro">
            <div class="modal-header-pro">
              <div>
                <h3>✨ Create New Course</h3>
                <p class="modal-sub">Publish a new astrology course with structured syllabus modules & lessons.</p>
              </div>
              <button class="close-btn-pro" (click)="openCourseModal = false">✕</button>
            </div>

            <form (ngSubmit)="createCourse()">
              <div class="form-group">
                <label>Course Title *</label>
                <input [(ngModel)]="newCourse.title" name="title" required placeholder="e.g. Advanced Vedic Astrology & Jathagam Mastery" class="ctrl"/>
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="newCourse.description" name="desc" rows="3" placeholder="Brief overview of course syllabus & learning goals..." class="ctrl"></textarea>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" [(ngModel)]="newCourse.price" name="price" required class="ctrl"/>
                </div>

                <div class="form-group">
                  <label>Category</label>
                  <input [(ngModel)]="newCourse.category" name="cat" placeholder="Astrology" class="ctrl"/>
                </div>

                <div class="form-group">
                  <label>Level</label>
                  <select [(ngModel)]="newCourse.level" name="lvl" class="ctrl">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Thumbnail Banner Image URL</label>
                <input [(ngModel)]="newCourse.thumbnail" name="thumb" placeholder="https://images.unsplash.com/photo-..." class="ctrl"/>
                @if (newCourse.thumbnail) {
                  <div class="thumb-preview-box" [style.background-image]="'url(' + newCourse.thumbnail + ')'">
                    <span class="preview-badge">Live Image Preview</span>
                  </div>
                }
              </div>

              <div class="modal-btns-pro">
                <button type="button" (click)="openCourseModal = false" class="btn-cancel-pro">Cancel</button>
                <button type="submit" class="btn-primary">
                  <span>🚀 Publish & Launch Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: ADD MODULE -->
      @if (openModuleModal) {
        <div class="modal-overlay">
          <div class="modal-box-pro">
            <div class="modal-header-pro">
              <div>
                <h3>📌 Add Syllabus Module</h3>
                <p class="modal-sub">Create a chapter / module to organize course lessons.</p>
              </div>
              <button class="close-btn-pro" (click)="openModuleModal = false">✕</button>
            </div>

            <form (ngSubmit)="addModule()">
              <div class="form-group">
                <label>Module Title *</label>
                <input [(ngModel)]="newModuleTitle" name="modTitle" required placeholder="e.g. Module 1: 12 Rasis & 27 Nakshatras Basics" class="ctrl"/>
              </div>
              <div class="modal-btns-pro">
                <button type="button" (click)="openModuleModal = false" class="btn-cancel-pro">Cancel</button>
                <button type="submit" class="btn-primary">
                  <span>+ Save Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- DEDICATED SYLLABUS MANAGEMENT DRAWER MODAL -->
      @if (openSyllabusDrawerModal) {
        <div class="modal-overlay">
          <div class="modal-box-pro syllabus-drawer-box">
            <div class="modal-header-pro">
              <div>
                <h3>📌 Syllabus Studio: {{ selectedCourseForSyllabus?.title }}</h3>
                <p class="modal-sub">Add, structure, and manage modules, video streams, audio, PDFs, and live classes.</p>
              </div>
              <button class="close-btn-pro" (click)="openSyllabusDrawerModal = false">✕</button>
            </div>

            <div class="drawer-course-summary-row">
              <span class="badge-role">{{ selectedCourseForSyllabus?.category }}</span>
              <span class="level-tag-pro" [ngClass]="(selectedCourseForSyllabus?.level || 'beginner').toLowerCase()">{{ selectedCourseForSyllabus?.level }}</span>
              <span class="badge-price-pro">₹{{ selectedCourseForSyllabus?.price }}</span>
            </div>

            <!-- Add Module Header Action -->
            <div class="drawer-actions-bar">
              <strong>Syllabus Modules ({{ selectedCourseForSyllabus?.modules?.length || 0 }})</strong>
              <button class="btn-primary btn-sm" (click)="selectCourseForModule(selectedCourseForSyllabus.id)">
                + Add New Module
              </button>
            </div>

            <!-- Modules & Lessons Accordion List inside Drawer -->
            <div class="drawer-modules-scroll-area">
              @if (!selectedCourseForSyllabus?.modules || selectedCourseForSyllabus?.modules.length === 0) {
                <div class="no-modules-placeholder">
                  <span>No modules created yet. Click <strong>+ Add New Module</strong> above to start building the syllabus.</span>
                </div>
              }

              @for (mod of selectedCourseForSyllabus?.modules; track mod.id; let modIdx = $index) {
                <div class="module-box-pro drawer-mod-box">
                  <div class="mod-title-pro">
                    <div class="mod-name-wrap">
                      <span class="mod-number">Module {{ modIdx + 1 }}</span>
                      <span class="mod-text">{{ mod.title }}</span>
                    </div>
                    <button class="btn-xs-pro gold" (click)="selectModuleForLesson(mod.id)">
                      + Add Lesson
                    </button>
                  </div>

                  <!-- Lessons List -->
                  <div class="lessons-list-pro">
                    @if (!mod.lessons || mod.lessons.length === 0) {
                      <div class="no-lessons-placeholder">
                        <small class="muted">No content attached to this module yet.</small>
                      </div>
                    }

                    @for (les of mod.lessons; track les.id || $index) {
                      <div class="lesson-chip-pro">
                        <div class="les-info-left">
                          <span class="type-icon-pro">
                            @switch (les.content_type) {
                              @case ('video') { <span class="chip-type video">🎥 Video</span> }
                              @case ('audio') { <span class="chip-type audio">🎵 Audio</span> }
                              @case ('pdf') { <span class="chip-type pdf">📄 PDF</span> }
                              @case ('live_link') { <span class="chip-type live">🔴 Live Link</span> }
                              @default { <span class="chip-type default">📝 Lesson</span> }
                            }
                          </span>
                          <span class="les-name-pro">{{ les.title }}</span>
                        </div>
                        @if (les.content_url) {
                          <a [href]="les.content_url" target="_blank" class="les-link-pro">
                            <span>View Media ↗</span>
                          </a>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="modal-btns-pro">
              <button type="button" class="btn-cancel-pro" (click)="openSyllabusDrawerModal = false">Close Studio</button>
            </div>
          </div>
        </div>
      }

      <!-- 4-STEP COURSE BUILDER WIZARD MODAL -->
      @if (openCourseWizardModal) {
        <div class="modal-overlay">
          <div class="modal-box-pro wizard-modal-box">
            <!-- Wizard Header with Steps Progress Indicator -->
            <div class="modal-header-pro">
              <div>
                <h3>✨ Step-by-Step Course Builder Studio</h3>
                <p class="modal-sub">Create, structure, and publish a complete astrology course in 4 steps.</p>
              </div>
              <button class="close-btn-pro" (click)="openCourseWizardModal = false">✕</button>
            </div>

            <!-- Progress Steps Nav Bar -->
            <div class="wizard-steps-bar">
              <div class="wizard-step-item" [class.active]="wizardStep === 1" [class.completed]="wizardStep > 1" (click)="wizardStep = 1">
                <span class="step-num">1</span>
                <span class="step-title">Course Info</span>
              </div>
              <div class="step-connector" [class.active]="wizardStep > 1"></div>

              <div class="wizard-step-item" [class.active]="wizardStep === 2" [class.completed]="wizardStep > 2" (click)="wizardStep >= 2 && (wizardStep = 2)">
                <span class="step-num">2</span>
                <span class="step-title">Modules</span>
              </div>
              <div class="step-connector" [class.active]="wizardStep > 2"></div>

              <div class="wizard-step-item" [class.active]="wizardStep === 3" [class.completed]="wizardStep > 3" (click)="wizardStep >= 3 && (wizardStep = 3)">
                <span class="step-num">3</span>
                <span class="step-title">Lessons</span>
              </div>
              <div class="step-connector" [class.active]="wizardStep > 3"></div>

              <div class="wizard-step-item" [class.active]="wizardStep === 4" (click)="wizardStep >= 4 && (wizardStep = 4)">
                <span class="step-num">4</span>
                <span class="step-title">Review & Launch</span>
              </div>
            </div>

            <!-- WIZARD STEP 1: COURSE INFO & PRICING -->
            @if (wizardStep === 1) {
              <div class="wizard-step-body">
                <div class="form-group">
                  <label>Course Title *</label>
                  <input [(ngModel)]="newCourse.title" name="wtitle" required placeholder="e.g. Advanced Vedic Astrology & Jathagam Mastery" class="ctrl"/>
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="newCourse.description" name="wdesc" rows="3" placeholder="Overview of course syllabus & learning goals..." class="ctrl"></textarea>
                </div>

                <div class="form-grid-3">
                  <div class="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" [(ngModel)]="newCourse.price" name="wprice" required class="ctrl"/>
                  </div>

                  <div class="form-group">
                    <label>Category</label>
                    <input [(ngModel)]="newCourse.category" name="wcat" placeholder="Astrology" class="ctrl"/>
                  </div>

                  <div class="form-group">
                    <label>Level</label>
                    <select [(ngModel)]="newCourse.level" name="wlvl" class="ctrl">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Thumbnail Banner Image URL</label>
                  <input [(ngModel)]="newCourse.thumbnail" name="wthumb" placeholder="https://images.unsplash.com/photo-..." class="ctrl"/>
                  @if (newCourse.thumbnail) {
                    <div class="thumb-preview-box" [style.background-image]="'url(' + newCourse.thumbnail + ')'">
                      <span class="preview-badge">Live Image Preview</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- WIZARD STEP 2: MODULES -->
            @if (wizardStep === 2) {
              <div class="wizard-step-body">
                <h4>📌 Step 2: Add Syllabus Modules</h4>
                <p class="modal-sub" style="margin-bottom: 14px;">Define chapter modules for this course.</p>

                <div class="form-group flex-gap">
                  <input [(ngModel)]="newModuleTitle" name="wModTitle" placeholder="e.g. Module 1: 12 Rasis & 27 Nakshatras" class="ctrl"/>
                  <button type="button" class="btn-primary" (click)="addModuleInWizard()">+ Add Module</button>
                </div>

                <div class="wizard-modules-list">
                  @if (!wizardModules || wizardModules.length === 0) {
                    <div class="no-modules-placeholder">
                      <span>No modules added yet. Enter module title above and click <strong>+ Add Module</strong>.</span>
                    </div>
                  }
                  @for (m of wizardModules; track m.id || $index; let mIdx = $index) {
                    <div class="module-box-pro">
                      <span>📌 <strong>Module {{ mIdx + 1 }}:</strong> {{ m.title }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- WIZARD STEP 3: LESSONS & MEDIA -->
            @if (wizardStep === 3) {
              <div class="wizard-step-body">
                <h4>🎬 Step 3: Attach Lessons & Media Content</h4>
                <p class="modal-sub" style="margin-bottom: 14px;">Select a module and attach video streams, audio, PDFs, or live links.</p>

                <div class="form-group">
                  <label>Select Target Module</label>
                  <select [(ngModel)]="selectedWizardModuleId" name="wModSel" class="ctrl">
                    @for (m of wizardModules; track m.id || $index; let mIdx = $index) {
                      <option [value]="m.id || mIdx">
                        Module {{ mIdx + 1 }}: {{ m.title }}
                      </option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label>Lesson Title *</label>
                  <input [(ngModel)]="newLesson.title" name="wltitle" placeholder="e.g. Introduction to Planetary Rulers" class="ctrl"/>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Content Type</label>
                    <select [(ngModel)]="newLesson.content_type" name="wltype" class="ctrl">
                      <option value="video">🎥 Video (MP4 / HLS Stream)</option>
                      <option value="audio">🎵 Audio MP3 Lesson</option>
                      <option value="pdf">📄 PDF Document</option>
                      <option value="live_link">🔴 Live Class Link (Google Meet / Zoom)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Duration</label>
                    <input [(ngModel)]="newLesson.duration" name="wldur" placeholder="e.g. 30 mins" class="ctrl"/>
                  </div>
                </div>

                <div class="form-group">
                  <label>Content URL / Streaming Link *</label>
                  <input [(ngModel)]="newLesson.content_url" name="wlurl" placeholder="https://..." class="ctrl"/>
                </div>

                <button type="button" class="btn-primary btn-sm" (click)="addLessonInWizard()">+ Attach Lesson to Module</button>
              </div>
            }

            <!-- WIZARD STEP 4: REVIEW & LAUNCH -->
            @if (wizardStep === 4) {
              <div class="wizard-step-body">
                <h4>🚀 Step 4: Course Summary & Review</h4>
                <p class="modal-sub" style="margin-bottom: 14px;">Verify course details before publishing live on the platform.</p>

                <div class="card-box" style="padding: 16px; background: rgba(0,0,0,0.4);">
                  <div class="drawer-course-summary-row" style="margin-bottom: 10px;">
                    <span class="level-tag-pro" [ngClass]="(newCourse.level || 'beginner').toLowerCase()">{{ newCourse.level }}</span>
                    <span class="category-tag-pro">{{ newCourse.category }}</span>
                    <span class="badge-price-pro">₹{{ newCourse.price }}</span>
                  </div>
                  <h3 style="color: #ffd700; margin: 0 0 6px;">{{ newCourse.title || 'Untitled Course' }}</h3>
                  <p class="muted" style="margin: 0 0 12px;">{{ newCourse.description || 'No description provided.' }}</p>
                  <div class="ledger-row">
                    <span>📌 Total Modules</span>
                    <strong>{{ wizardModules.length }}</strong>
                  </div>
                </div>
              </div>
            }

            <!-- Wizard Action Footer Buttons -->
            <div class="modal-btns-pro flex-between">
              <button type="button" class="btn-cancel-pro" [disabled]="wizardStep === 1" (click)="wizardStep > 1 && (wizardStep = wizardStep - 1)">
                ⬅️ Back
              </button>

              <div class="flex-gap">
                <button type="button" class="btn-cancel-pro" (click)="openCourseWizardModal = false">Cancel</button>
                @if (wizardStep < 4) {
                  <button type="button" class="btn-primary" (click)="wizardStep = wizardStep + 1">
                    <span>Next Step ➡️</span>
                  </button>
                }
                @if (wizardStep === 4) {
                  <button type="button" class="btn-primary" (click)="publishWizardCourse()">
                    <span>🚀 Launch Course Live</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: UPDATE COURIER -->
      @if (selectedOrderForCourier) {
        <div class="modal-overlay">
          <div class="modal-box">
            <h3>Update Courier Dispatch Details</h3>
            <p>Order Number: <strong>{{ selectedOrderForCourier.order_number }}</strong></p>
            <form (ngSubmit)="saveCourierStatus()">
              <div class="form-group"><label>Shipping Status</label>
                <select [(ngModel)]="courierForm.status" name="cstatus" class="ctrl">
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div class="form-group"><label>Courier Partner Name</label><input [(ngModel)]="courierForm.courier_partner" name="cpartner" placeholder="e.g. Blue Dart / DTDC" class="ctrl"/></div>
              <div class="form-group"><label>AWB Tracking Number</label><input [(ngModel)]="courierForm.awb_number" name="cawb" placeholder="e.g. AWB-991823" class="ctrl"/></div>
              <div class="modal-btns">
                <button type="button" (click)="selectedOrderForCourier = null" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-primary">Save Courier Status</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: GRADE EXAM SUBMISSION -->
      @if (selectedSubmissionForGrading) {
        <div class="modal-overlay">
          <div class="modal-box">
            <h3>Grade & Verify Student Exam</h3>
            <p>Student: <strong>{{ selectedSubmissionForGrading.student_name }}</strong></p>
            <form (ngSubmit)="saveGrading()">
              <div class="form-group"><label>Marks / Score (Out of 100)</label><input type="number" [(ngModel)]="gradingForm.score" name="gscore" required class="ctrl"/></div>
              <div class="form-group"><label>Approval Status</label>
                <select [(ngModel)]="gradingForm.status" name="gstatus" class="ctrl">
                  <option value="Approved">Approved (Issue E-Certificate if Score ≥ 60)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div class="form-group"><label>Evaluator Notes</label><textarea [(ngModel)]="gradingForm.evaluator_notes" name="gnotes" class="ctrl"></textarea></div>
              <div class="modal-btns">
                <button type="button" (click)="selectedSubmissionForGrading = null" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-primary">Submit Grade & Auto-Issue Certificate</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: VIDEO PREVIEW -->
      <div *ngIf="previewVideoModal" class="modal-overlay" (click)="closeVideoPreview()">
        <div class="modal-box video-modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>🎬 {{ previewVideoTitle }} - வீடியோ முன்னோட்டம் (Video Preview)</h3>
            <button class="close-btn" (click)="closeVideoPreview()">&times;</button>
          </div>
          <div class="video-preview-body" style="margin: 16px 0;">
            <div *ngIf="previewVideoSafeUrl" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
              <iframe 
                [src]="previewVideoSafeUrl" 
                title="Video Preview" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
              </iframe>
            </div>
            <div *ngIf="!previewVideoSafeUrl" style="text-align: center;">
              <video [src]="previewVideoUrl" controls style="width: 100%; max-height: 320px; border-radius: 12px; background: #000;"></video>
            </div>
          </div>
          <div class="modal-btns">
            <button type="button" (click)="closeVideoPreview()" class="btn-primary">Done</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
      color: #1e293b;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* LEFT SIDEBAR STYLING - MEDIUM DARK SLATE / NAVY THEME */
    .sidebar {
      width: 270px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      flex-shrink: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand .icon { font-size: 26px; }
    .brand h2 { font-size: 20px; color: #fbbf24; margin: 0; font-weight: 800; letter-spacing: 0.3px; }
    .brand-sub { font-size: 11px; color: #94a3b8; font-weight: 500; }

    .drawer-close-btn {
      display: none;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .drawer-close-btn:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 20px;
      flex: 1;
    }

    .nav-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 10px;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-menu button.active {
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.06) 100%);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-left: 4px solid #f59e0b;
      color: #fbbf24;
      font-weight: 700;
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
    }

    @media (hover: hover) {
      .nav-menu button:hover:not(.active) {
        background: rgba(255, 255, 255, 0.06);
        color: #f8fafc;
      }
    }

    .nav-icon { font-size: 16px; }

    .user-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      margin-top: auto;
    }

    .user-info-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
    }

    .u-details { flex: 1; overflow: hidden; }
    .u-name { display: block; font-size: 13px; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .u-role { font-size: 9px; color: #fbbf24; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background: rgba(245, 158, 11, 0.15); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.25); display: inline-block; margin-top: 2px; }

    .btn-logout-full {
      width: 100%;
      padding: 9px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-logout-full:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    /* MAIN PANEL */
    .main-panel {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      background: #f8fafc;
    }

    .header-banner {
      margin-bottom: 28px;
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-banner h1 { font-size: 24px; margin: 0 0 4px 0; color: #0f172a; font-weight: 800; }
    .header-banner p { margin: 0; color: #64748b; font-size: 13px; font-weight: 400; }

    .btn-primary {
      padding: 10px 18px;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      border: none;
      border-radius: 8px;
      color: #ffffff;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(180, 83, 9, 0.25);
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
      box-shadow: 0 4px 12px rgba(180, 83, 9, 0.35);
    }

    /* METRICS & CARDS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      border-radius: 16px;
      padding: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }

    .metric-card.gold { border-left: 4px solid #f59e0b; }
    .metric-card.blue { border-left: 4px solid #3b82f6; }
    .metric-card.purple { border-left: 4px solid #a855f7; }
    .metric-card.green { border-left: 4px solid #10b981; }

    .metric-card .icon { font-size: 26px; margin-bottom: 6px; }
    .metric-card .val { font-size: 24px; font-weight: 800; color: #0f172a; }
    .metric-card .lbl { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; }

    .analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
      border-radius: 16px;
      padding: 24px;
    }

    .card-box h3 { margin: 0 0 16px 0; font-size: 16px; color: #0f172a; font-weight: 700; }

    .ledger-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      color: #334155;
    }

    .ledger-row strong { color: #0f172a; font-weight: 700; }

    .team-mini-list { display: flex; flex-direction: column; gap: 10px; }
    .mini-item { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px; }
    .mini-avatar { width: 34px; height: 34px; border-radius: 50%; background: #f59e0b; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; }
    .mini-info { flex: 1; }
    .mini-info strong { display: block; font-size: 13px; color: #0f172a; font-weight: 600; }
    .mini-info small { font-size: 11px; color: #64748b; }

    .status.active { color: #059669; font-size: 11px; font-weight: 600; }
    .status.suspended { color: #dc2626; font-size: 11px; font-weight: 600; }

    .data-table { width: 100%; border-collapse: collapse; background: #ffffff; }
    .data-table th, .data-table td { padding: 13px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .data-table th { background: #f8fafc; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    .data-table td { color: #1e293b; }
    .data-table td strong { color: #0f172a; }

    .badge-role { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-pill.shipped, .status-pill.completed { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .status-pill.processing, .status-pill.pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .status-pill.approved { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }

    .badge-type { background: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .badge-type.courier { background: #faf5ff; color: #9333ea; }

    .pdf-link { color: #2563eb; font-size: 12px; text-decoration: none; font-weight: 600; }
    .pdf-link:hover { text-decoration: underline; }

    .btn-sm { padding: 6px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #1e293b; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; }
    .btn-sm:hover { background: #e2e8f0; color: #0f172a; }
    .btn-sm.danger { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
    .btn-sm.danger:hover { background: #fee2e2; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
    .course-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
    .card-image { height: 150px; background-size: cover; background-position: center; position: relative; padding: 12px; }
    .badge-price { position: absolute; top: 12px; right: 12px; background: #b45309; color: #fff; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    .card-content { padding: 18px; }
    .level-tag { font-size: 10px; color: #9333ea; background: #faf5ff; border: 1px solid #e9d5ff; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .card-content h4 { margin: 8px 0; font-size: 16px; color: #0f172a; font-weight: 700; }

    .modules-container { margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; }
    .module-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; color: #475569; }
    .btn-xs { padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; border-radius: 4px; font-size: 11px; cursor: pointer; }
    .btn-xs:hover { background: #f1f5f9; }

    .module-box { background: #ffffff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; margin-bottom: 6px; }
    .mod-title { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #b45309; margin-bottom: 6px; }

    .lessons-list { display: flex; flex-direction: column; gap: 4px; }
    .lesson-chip { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px; font-size: 11px; color: #334155; }
    .les-link { color: #2563eb; text-decoration: none; font-size: 11px; font-weight: 500; }

    /* PROFESSIONAL COURSE STUDIO REDESIGN STYLES */
    .course-filters-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .search-box-wrap { position: relative; flex: 1; min-width: 260px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #8a8ab0; }
    .search-ctrl { padding-left: 36px !important; background: rgba(10, 6, 24, 0.8) !important; border-color: rgba(212, 175, 55, 0.25) !important; }
    .search-ctrl:focus { border-color: #ffd700 !important; box-shadow: 0 0 12px rgba(255, 215, 0, 0.2); }
    .course-card-pro { background: rgba(22, 15, 51, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); }
    .course-card-pro:hover { transform: translateY(-4px); border-color: rgba(212, 175, 55, 0.6); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.15); }
    .card-image-pro { height: 170px; background-size: cover; background-position: center; position: relative; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; }
    .card-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(18,11,41,0.95) 100%); }
    .badge-price-pro { position: relative; z-index: 2; align-self: flex-end; background: linear-gradient(135deg, #ffd700, #b8860b); color: #000; font-weight: 800; padding: 6px 14px; border-radius: 20px; font-size: 13px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    .card-tags-row { position: relative; z-index: 2; display: flex; gap: 8px; }
    .level-tag-pro { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: capitalize; letter-spacing: 0.3px; }
    .level-tag-pro.beginner { background: rgba(34, 197, 94, 0.25); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .level-tag-pro.intermediate { background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .level-tag-pro.advanced { background: rgba(168, 85, 247, 0.25); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); }
    .category-tag-pro { font-size: 11px; font-weight: 600; background: rgba(255, 255, 255, 0.15); color: #e2e8f0; padding: 4px 10px; border-radius: 6px; backdrop-filter: blur(4px); }
    .card-content-pro { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .course-title-pro { margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #fff; line-height: 1.4; }
    .course-desc-pro { margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5; }
    .modules-container-pro { margin-top: auto; background: rgba(10, 6, 24, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px; }
    .module-header-pro { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; }
    .btn-xs-pro { padding: 5px 10px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-xs-pro:hover { background: rgba(255, 255, 255, 0.18); border-color: rgba(255, 255, 255, 0.4); }
    .btn-xs-pro.gold { background: rgba(212, 175, 55, 0.2); border-color: rgba(212, 175, 55, 0.5); color: #ffd700; }
    .btn-xs-pro.gold:hover { background: #ffd700; color: #000; }
    .no-modules-placeholder { padding: 12px; font-size: 12px; color: #8a8ab0; text-align: center; background: rgba(255, 255, 255, 0.02); border-radius: 8px; }
    .module-box-pro { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; }
    .module-box-pro:last-child { margin-bottom: 0; }
    .mod-title-pro { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #ffd700; margin-bottom: 8px; }
    .mod-name-wrap { display: flex; align-items: center; gap: 6px; }
    .mod-number { font-size: 10px; background: rgba(212, 175, 55, 0.2); color: #ffd700; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
    .mod-text { color: #f1f5f9; font-weight: 600; }
    .lessons-list-pro { display: flex; flex-direction: column; gap: 6px; }
    .no-lessons-placeholder { padding: 6px 8px; font-size: 11px; }
    .lesson-chip-pro { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); padding: 8px 10px; border-radius: 8px; font-size: 12px; }
    .les-info-left { display: flex; align-items: center; gap: 8px; overflow: hidden; }
    .les-name-pro { color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chip-type { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
    .chip-type.video { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .chip-type.audio { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
    .chip-type.pdf { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .chip-type.live { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .chip-type.default { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }
    .les-link-pro { color: #60a5fa; text-decoration: none; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); transition: all 0.2s; }
    .les-link-pro:hover { background: #3b82f6; color: #fff; }

    /* MODALS */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15); border-radius: 20px; padding: 24px; width: 100%; max-width: 460px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #0f172a; font-weight: 700; }
    .close-btn { background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: #fee2e2; color: #dc2626; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 5px; }
    .ctrl { width: 100%; box-sizing: border-box; padding: 10px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; font-size: 13px; outline: none; transition: all 0.2s; }
    .ctrl:focus { border-color: #d97706; background: #ffffff; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15); }
    .modal-btns { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .btn-cancel { padding: 9px 16px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-cancel:hover { background: #e2e8f0; color: #0f172a; }

    /* Rasi Palan Light Theme Styles */
    .header-actions-group { display: flex; gap: 10px; align-items: center; }
    .btn-secondary-ed { padding: 9px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #334155; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-secondary-ed:hover { background: #f1f5f9; color: #0f172a; }
    .alert-success-banner { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.08); }

    .rasi-controls-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; background: #ffffff; padding: 14px 18px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); }
    .rasi-type-bar { display: flex; gap: 8px; flex-wrap: wrap; }
    .rasi-type-bar button { padding: 7px 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 20px; color: #475569; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .rasi-type-bar button.active { background: #fffbeb; border-color: #fde68a; color: #b45309; font-weight: 700; box-shadow: 0 1px 3px rgba(180, 83, 9, 0.1); }
    .rasi-date-filter { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; font-weight: 500; }
    .date-input-ctrl { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; padding: 6px 10px; font-size: 12px; }
    .btn-xs-refresh { padding: 6px 12px; background: #fffbeb; border: 1px solid #fde68a; color: #b45309; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

    .center-loader-box { text-align: center; padding: 40px; color: #b45309; font-size: 14px; font-weight: 600; }
    
    /* COMPACT RASI CARDS (ICON & NAME ONLY) */
    .rasi-compact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .rasi-compact-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .rasi-compact-card:hover {
      transform: translateY(-3px);
      border-color: #d97706;
      box-shadow: 0 8px 22px rgba(217, 119, 6, 0.12);
      background: #fffdfa;
    }
    .rasi-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fde68a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(180, 83, 9, 0.08);
    }
    .rasi-compact-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .rasi-compact-tamil {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .rasi-compact-eng {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    .rasi-compact-badges {
      display: flex;
      gap: 4px;
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .badge-mini {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .badge-mini.has-text { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-mini.has-audio { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-mini.has-video { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .rasi-card-edit-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #64748b;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .rasi-compact-card:hover .rasi-card-edit-btn {
      background: #fffbeb;
      border-color: #fde68a;
      color: #b45309;
      opacity: 1;
      transform: scale(1.1);
    }
    .rasi-edit-modal-box {
      max-width: 560px;
    }

    .rasi-editor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
    .rasi-editor-card { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.2s, box-shadow 0.2s; }
    .rasi-editor-card:hover { border-color: #cbd5e1; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
    .rasi-ed-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    .rasi-left-meta { display: flex; align-items: center; gap: 12px; }
    .rasi-symbol-ed { font-size: 30px; line-height: 1; }
    .rasi-title-group { display: flex; flex-direction: column; gap: 2px; }
    .rasi-tamil-title { color: #b45309; font-size: 16px; font-weight: 700; }
    .rasi-eng-sub { font-size: 11px; color: #64748b; }
    .btn-card-save { padding: 6px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-card-save:hover { background: #d1fae5; color: #047857; }

    .form-group-rasi { display: flex; flex-direction: column; gap: 6px; }
    .textarea-header { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; font-weight: 500; }
    .char-count { font-size: 10px; color: #2563eb; font-weight: 600; }
    .rasi-textarea { width: 100%; box-sizing: border-box; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; font-size: 13px; padding: 10px; resize: vertical; line-height: 1.5; font-family: inherit; transition: all 0.2s; }
    .rasi-textarea:focus { border-color: #d97706; background: #ffffff; outline: none; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12); }

    .media-input-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      transition: border-color 0.2s;
    }
    .media-input-box.audio-box { border-left: 3px solid #f59e0b; }
    .media-input-box.video-box { 
      border-left: 3px solid #3b82f6; 
      background: #f8faff;
      border-color: #dbeafe;
    }
    .media-lbl {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #334155;
      font-weight: 600;
    }
    .media-lbl.video-lbl { color: #1d4ed8; }
    .media-icon { font-size: 13px; }
    .media-input-row { display: flex; gap: 6px; align-items: center; }
    .video-hint-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.3;
    }

    .btn-audio-test { padding: 7px 12px; background: #fffbeb; border: 1px solid #fde68a; color: #b45309; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .btn-audio-test:hover { background: #fef3c7; }
    .btn-video-test { padding: 7px 12px; background: #2563eb; border: 1px solid #1d4ed8; color: #ffffff; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2); }
    .btn-video-test:hover { background: #1d4ed8; box-shadow: 0 2px 6px rgba(29, 78, 216, 0.3); }
    .video-modal-box { max-width: 580px; }

    .card-footer-mini { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 11px; }
    .btn-link-reset { background: none; border: none; color: #64748b; font-size: 11px; cursor: pointer; text-decoration: underline; padding: 0; }
    .btn-link-reset:hover { color: #b45309; }
    .status-dot-live { color: #059669; font-size: 10px; font-weight: 600; }
    .ctrl-sm { width: 100%; box-sizing: border-box; padding: 7px 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 12px; }
    .ctrl-sm:focus { border-color: #d97706; background: #ffffff; }

    .score-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
    .score-badge.good { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .score-badge.bad { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

    .match-score-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; margin-bottom: 12px; }
    .big-score-badge { font-size: 28px; font-weight: 800; background: #ecfdf5; color: #059669; padding: 8px 16px; border-radius: 12px; border: 1px solid #a7f3d0; }
    .big-score-badge.good { background: #ecfdf5; color: #059669; }
    .match-verdict { font-size: 16px; color: #0f172a; font-weight: 600; }
    .breakdown-table { display: flex; flex-direction: column; gap: 6px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; }
    .match-yes { color: #059669; font-weight: 600; }
    .match-no { color: #dc2626; font-weight: 600; }

    .success-msg { color: #059669; font-size: 13px; margin-top: 10px; font-weight: 600; }
    .muted { color: #64748b; font-size: 12px; }
    .address-col { max-width: 160px; font-size: 11px; }

    .btn-tel-call {
      padding: 4px 9px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 0.2s;
    }
    .btn-tel-call:hover { background: #dbeafe; color: #1e40af; }
    .btn-wa-link {
      padding: 4px 9px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 0.2s;
    }
    .btn-wa-link:hover { background: #d1fae5; color: #047857; }
    .notes-preview-snippet {
      font-size: 11px;
      color: #475569;
      background: #f1f5f9;
      padding: 3px 6px;
      border-radius: 4px;
      margin-top: 4px;
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Availability Engine Styles */
    .calendar-matrix-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
      gap: 8px;
    }
    .day-avail-card {
      padding: 10px 8px;
      border-radius: 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      user-select: none;
    }
    .day-avail-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }
    .day-avail-card.free {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .day-avail-card.busy {
      background: #fef2f2;
      border-color: #fecaca;
    }
    .day-name-tamil {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }
    .day-date-str {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .day-status-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 2px;
    }
    .day-status-tag.tag-free {
      background: #dcfce7;
      color: #15803d;
    }
    .day-status-tag.tag-busy {
      background: #fee2e2;
      color: #b91c1c;
    }

    /* MOBILE TOPBAR & DRAWER STYLING */
    .mobile-topbar { display: none; }
    .mobile-backdrop { display: none; }
    .desktop-only { display: flex; }

    .main-panel { min-width: 0; }
    .card-box { overflow-x: auto; box-sizing: border-box; }

    @media (max-width: 992px) {
      .desktop-only { display: none; }
      .drawer-close-btn { display: flex; }

      .mobile-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #ffffff;
        border-bottom: 1px solid #e2e8f0;
        position: sticky;
        top: 0;
        z-index: 990;
      }

      .mobile-topbar .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: none;
        padding-bottom: 0;
      }

      .mobile-topbar .brand .icon { font-size: 22px; }
      .mobile-topbar .brand h2 {
        font-size: 18px;
        color: #b45309;
        margin: 0;
        font-weight: 700;
      }

      .hamburger-btn {
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #b45309;
        padding: 8px 14px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .hamburger-btn:active {
        background: #f59e0b;
        color: #fff;
      }

      .dashboard-wrapper {
        flex-direction: column;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: -310px;
        bottom: 0;
        width: 280px;
        height: 100vh;
        z-index: 1000;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15);
        border-right: 1px solid #e2e8f0;
        background: #ffffff;
        overflow-y: auto;
      }

      .sidebar.mobile-open {
        left: 0;
      }

      .nav-menu {
        flex-direction: column;
        overflow-x: visible;
        margin-top: 16px;
        gap: 6px;
      }

      .nav-menu button {
        white-space: normal;
        font-size: 13px;
        padding: 12px 14px;
      }

      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        z-index: 995;
      }

      .main-panel {
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
      }

      .analytics-row {
        grid-template-columns: 1fr;
      }

      .header-banner h1 {
        font-size: 18px;
      }

      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
      }

      .courses-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
=======
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
>>>>>>> ed937e4ca91df866e421fa7b4b2a4f32408cf74a
})
export class AdminDashboardComponent implements OnInit {
  currentTab = 'overview';
  currentUser: User | null = null;
  mobileMenuOpen = false;

<<<<<<< HEAD
  selectTab(tab: string): void {
    this.currentTab = tab;
    this.mobileMenuOpen = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    if (tab === 'rasi-editor') {
      this.loadRasiPredictions();
    }
  }


  metrics: Metrics | null = null;
  teamList: any[] = [];
  courses: any[] = [];
  bookOrders: any[] = [];
  submissions: any[] = [];
  serviceBookings: any[] = [];

  // Astrologer Availability & Date Blocking State
  availabilityRecords: any[] = [];
  blockedDatesList: string[] = [];
  upcoming14Days: { date: string; dayName: string; isBlocked: boolean; reason?: string }[] = [];
  selectedCustomDate = new Date().toISOString().split('T')[0];
  showCalendarMatrix = false;
  blockDateForm = {
    date: new Date().toISOString().split('T')[0],
    status: 'busy',
    reason: ''
  };
  availabilitySuccessMsg = '';
  bookingFilterStatus = 'all';
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

  // Modals
  openAddAdminModal = false;
  openCourseModal = false;
  openModuleModal = false;
  openLessonModal = false;

  newAdmin = { name: '', email: '', password: '', phone: '', role: 'admin' };
  newCourse = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner', thumbnail: '' };

  selectedCourseIdForModule: number | null = null;
  newModuleTitle = '';

  selectedModuleIdForLesson: number | null = null;
  newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };

  selectedOrderForCourier: any = null;
  courierForm = { status: 'Shipped', courier_partner: 'Blue Dart', awb_number: '' };

  selectedSubmissionForGrading: any = null;
  gradingForm = { score: 85, status: 'Approved', evaluator_notes: 'Great work.' };

  // === NEW: Phase 4 Admin Tab Data ===
  marriageMatches: any[] = [];
  paymentTransactions: any[] = [];
  selectedMatch: any = null;
  notificationsToday = 0;

  // Marriage Matching & Varan Search Consultation State
  matchFilterType: 'all' | 'pair_match' | 'single_search' = 'all';
  matchNotesSaveMsg = '';
  newLeadModalOpen = false;
  newLeadForm = {
    request_type: 'single_search',
    candidate_gender: 'groom',
    contact_phone: '',
    candidate_name: '',
    candidate_dob: '',
    candidate_rasi: 'மேஷம்',
    candidate_star: '',
    preferences: ''
  };

  // Rasi Palan Editor State
  selectedRasiIndex: number | null = null;
  selectedRasiDate = new Date().toISOString().split('T')[0];
  rasiEditorType = 'daily';
  rasiPublishing = false;
  rasiPredictionsLoading = false;
  rasiSaveSuccessMsg = '';

  openRasiModal(index: number): void {
    this.selectedRasiIndex = index;
  }

  closeRasiModal(): void {
    this.selectedRasiIndex = null;
  }

  rasiTypes = [
    { label: 'Daily', tamilLabel: 'தினசரி பலன்', val: 'daily' },
    { label: 'Weekly', tamilLabel: 'வார பலன்', val: 'weekly' },
    { label: 'Monthly', tamilLabel: 'மாத பலன்', val: 'monthly' },
    { label: 'Yearly', tamilLabel: 'வருட பலன்', val: 'yearly' }
  ];

  // User-Side authentic Rasi list with symbols, English names and Dates
  rasiEditorList = [
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20' }
  ];

  defaultRasiPredictions: Record<string, string> = {
    'மேஷம்': 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.',
    'ரிஷபம்': 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
    'மிதுனம்': 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
    'கடகம்': 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.',
    'சிம்மம்': 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.',
    'கன்னி': 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.',
    'துலாம்': 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.',
    'விருச்சிகம்': 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.',
    'தனுசு': 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.',
    'மகரம்': 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.',
    'கும்பம்': 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.',
    'மீனம்': 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.'
  };

  rasiPredictions: { rasi_name: string; prediction_text: string; audio_url: string; video_url: string }[] = this.rasiEditorList.map(r => ({
    rasi_name: r.name,
    prediction_text: this.defaultRasiPredictions[r.name] || '',
    audio_url: '',
    video_url: ''
  }));

  // Video Preview Modal State
  previewVideoModal = false;
  previewVideoUrl = '';
  previewVideoTitle = '';
  previewVideoSafeUrl: SafeResourceUrl | null = null;

  // Notification Broadcast Form
  broadcastForm = { target: 'all', user_id: null as number | null, type: 'general', title: '', body: '' };
  broadcastMsg = '';

  // Daily Rasi Notification Toggle
  dailyNotifEnabled = true;
  dailyNotifOptedInCount = 0;
  dailyNotifLoading = false;

  // Loading States
  isLoadingCourses = false;
  isLoadingGrading = false;
  isLoadingServices = false;
  isLoadingTeam = false;
  isLoadingCourier = false;
  isLoadingMatches = false;
  isLoadingPayments = false;
  isLoadingOverview = false;

  // Course Studio Search & Filters
  courseSearchQuery = '';
  selectedCourseLevelFilter = 'all';

  // Course Builder Wizard & Syllabus Drawer State
  openCourseWizardModal = false;
  wizardStep = 1;
  wizardModules: any[] = [];
  selectedWizardModuleId: any = 0;

  openSyllabusDrawerModal = false;
  selectedCourseForSyllabus: any = null;

  openNewCourseWizard(): void {
    this.wizardStep = 1;
    this.newCourse = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner', thumbnail: '' };
    this.wizardModules = [];
    this.openCourseWizardModal = true;
  }

  openSyllabusDrawer(course: any): void {
    this.selectedCourseForSyllabus = course;
    this.openSyllabusDrawerModal = true;
  }

  getCourseModulesCount(course: any): number {
    return course.modules?.length || 0;
  }

  getCourseLessonsCount(course: any): number {
    if (!course.modules) return 0;
    return course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  }

  addModuleInWizard(): void {
    if (!this.newModuleTitle) return;
    this.wizardModules.push({
      id: Date.now(),
      title: this.newModuleTitle,
      lessons: []
    });
    this.newModuleTitle = '';
  }

  addLessonInWizard(): void {
    if (!this.newLesson.title) return;
    const mod = this.wizardModules.find((m, idx) => (m.id === Number(this.selectedWizardModuleId) || idx === Number(this.selectedWizardModuleId)));
    if (mod) {
      if (!mod.lessons) mod.lessons = [];
      mod.lessons.push({ ...this.newLesson });
      this.newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };
      alert('Lesson attached successfully to module!');
    }
  }

  publishWizardCourse(): void {
    (this.newCourse as any).modules = this.wizardModules;
    this.createCourse();
    this.openCourseWizardModal = false;
  }

  getFilteredCourses(): any[] {
    if (!this.courses) return [];
    return this.courses.filter(c => {
      const matchesSearch = !this.courseSearchQuery ||
        c.title?.toLowerCase().includes(this.courseSearchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(this.courseSearchQuery.toLowerCase());
      const matchesLevel = this.selectedCourseLevelFilter === 'all' ||
        (c.level || '').toLowerCase() === this.selectedCourseLevelFilter.toLowerCase();
      return matchesSearch && matchesLevel;
    });
  }

  getTotalModulesCount(): number {
    if (!this.courses) return 0;
    return this.courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  }

  getTotalLessonsCount(): number {
    if (!this.courses) return 0;
    return this.courses.reduce((acc, c) => {
      const modLessons = (c.modules || []).reduce((mAcc: number, m: any) => mAcc + (m.lessons?.length || 0), 0);
      return acc + modLessons;
    }, 0);
  }

=======
>>>>>>> ed937e4ca91df866e421fa7b4b2a4f32408cf74a
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.resetAllToDefaultsState();

    // Check query params for initial tab (e.g. /admin?tab=services)
    this.route.queryParams.subscribe(params => {
<<<<<<< HEAD
      const tab = params['tab'] || 'overview';
      this.currentTab = tab;
      this.loadActiveTabData(tab);
    });

    this.preloadAllTabsData();
  }

  preloadAllTabsData(): void {
    if (typeof window === 'undefined') return;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/courses', headers).subscribe({
      next: (res) => { this.courses = res.courses || []; this.cdr.detectChanges(); }
    });
    this.http.get<any>('http://127.0.0.1:8000/api/admin/dashboard-metrics', headers).subscribe({
      next: (res) => { this.metrics = res.metrics; this.cdr.detectChanges(); }
    });
    this.http.get<any>('http://127.0.0.1:8000/api/admin/team', headers).subscribe({
      next: (res) => { this.teamList = res.admins || []; this.cdr.detectChanges(); }
    });
    this.http.get<any>('http://127.0.0.1:8000/api/admin/book-orders', headers).subscribe({
      next: (res) => { this.bookOrders = res.orders || []; this.cdr.detectChanges(); }
    });
  }

  loadActiveTabData(tab: string): void {
    if (typeof window === 'undefined') return;
    const headers = this.authService.getAuthHeaders();

    const handleAuthError = (err: any) => {
      if (err?.status === 401) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    };

    setTimeout(() => {
      switch (tab) {
        case 'lms':
          this.isLoadingCourses = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/courses', headers).subscribe({
            next: (res) => {
              this.courses = res.courses || [];
              this.isLoadingCourses = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingCourses = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'overview':
          this.isLoadingOverview = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/dashboard-metrics', headers).subscribe({
            next: (res) => {
              this.metrics = res.metrics;
              this.isLoadingOverview = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingOverview = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'team':
          this.isLoadingTeam = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/team', headers).subscribe({
            next: (res) => {
              this.teamList = res.admins || [];
              this.isLoadingTeam = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingTeam = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'courier':
          this.isLoadingCourier = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/book-orders', headers).subscribe({
            next: (res) => {
              this.bookOrders = res.orders || [];
              this.isLoadingCourier = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingCourier = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'grading':
          this.isLoadingGrading = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/submissions', headers).subscribe({
            next: (res) => {
              this.submissions = res.submissions || [];
              this.isLoadingGrading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingGrading = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'services':
          this.isLoadingServices = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/bookings', headers).subscribe({
            next: (res) => {
              this.serviceBookings = Array.isArray(res) ? res : (res.bookings || []);
              this.isLoadingServices = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingServices = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'matches':
          this.isLoadingMatches = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/marriage-matches', headers).subscribe({
            next: (res) => {
              this.marriageMatches = (res.matches || []).map((m: any) => ({
                ...m,
                match_details: typeof m.match_details === 'string' ? JSON.parse(m.match_details) : (m.match_details || [])
              }));
              this.isLoadingMatches = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingMatches = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'payments':
          this.isLoadingPayments = true;
          this.cdr.detectChanges();
          this.http.get<any>('http://127.0.0.1:8000/api/admin/payment-transactions', headers).subscribe({
            next: (res) => {
              this.paymentTransactions = res.payments || [];
              this.isLoadingPayments = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              this.isLoadingPayments = false;
              this.cdr.detectChanges();
            }
          });
          break;

        case 'broadcast':
          this.http.get<any>('http://127.0.0.1:8000/api/admin/notifications/daily-rasi-status', headers).subscribe({
            next: (res) => {
              this.dailyNotifEnabled = res.enabled;
              this.dailyNotifOptedInCount = res.opted_in_users || 0;
              this.cdr.detectChanges();
            },
            error: (err) => {
              handleAuthError(err);
              console.error('Daily rasi notification status fetch error:', err);
            }
          });
          break;

        case 'rasi-editor':
          this.loadRasiPredictions();
          break;

        default:
          break;
      }
    }, 0);
  }

  loadAllData(): void {
    if (typeof window === 'undefined') return;
    const headers = this.authService.getAuthHeaders();

    // Load Metrics Overview
    this.http.get<any>('http://127.0.0.1:8000/api/admin/dashboard-metrics', headers).subscribe(res => {
      this.metrics = res.metrics;
      this.cdr.detectChanges();
    });

    // Load Team
    this.http.get<any>('http://127.0.0.1:8000/api/admin/team', headers).subscribe(res => {
      this.teamList = res.admins;
      this.cdr.detectChanges();
    });

    // Load Courses
    this.http.get<any>('http://127.0.0.1:8000/api/admin/courses', headers).subscribe(res => {
      this.courses = res.courses;
      this.cdr.detectChanges();
    });

    // Load Book Orders
    this.http.get<any>('http://127.0.0.1:8000/api/admin/book-orders', headers).subscribe(res => {
      this.bookOrders = res.orders;
      this.cdr.detectChanges();
    });


    // Load Submissions
    this.http.get<any>('http://127.0.0.1:8000/api/admin/submissions', headers).subscribe(res => {
      this.submissions = res.submissions;
      this.cdr.detectChanges();
    });

    // Load Availability
    this.loadAvailabilityData();

    // Load Astrology Service Consultations / Bookings
    this.http.get<any>('http://127.0.0.1:8000/api/admin/bookings', headers).subscribe(res => {
      this.serviceBookings = res;
      this.cdr.detectChanges();
    });

    // Load Marriage Matches
    this.http.get<any>('http://127.0.0.1:8000/api/admin/marriage-matches', headers).subscribe(res => {
      this.marriageMatches = (res.matches || []).map((m: any) => ({
        ...m,
        match_details: typeof m.match_details === 'string' ? JSON.parse(m.match_details) : (m.match_details || [])
      }));
      this.cdr.detectChanges();
    });

    // Load Payment Transactions
    this.http.get<any>('http://127.0.0.1:8000/api/admin/payment-transactions', headers).subscribe(res => {
      this.paymentTransactions = res.payments || [];
      this.cdr.detectChanges();
    });
  }

  formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadAvailabilityData(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/availability', headers).subscribe(res => {
      this.availabilityRecords = res.records || [];
      this.blockedDatesList = (this.availabilityRecords || [])
        .filter(r => r.status === 'busy' || r.status === 'blocked')
        .map(r => String(r.date).substring(0, 10));
      this.generate14DaysMatrix();
      this.cdr.detectChanges();
    });
  }

  generate14DaysMatrix(): void {
    const tamilDays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
    const list: { date: string; dayName: string; isBlocked: boolean; reason?: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const dateStr = this.formatDateKey(d);
      const isBlocked = this.blockedDatesList.includes(dateStr);

      list.push({
        date: dateStr,
        dayName: tamilDays[d.getDay()],
        isBlocked: isBlocked,
        reason: isBlocked ? 'ஜோதிடர் விடுப்பு (Busy / Blocked)' : ''
      });
    }

    this.upcoming14Days = list;
  }

  toggleAvailability(date: string, targetStatus: 'busy' | 'available', reason?: string): void {
    const dateStr = String(date).substring(0, 10);
    const isNowBlocked = targetStatus === 'busy';

    // 1. Instant optimistic UI toggle
    const dayItem = this.upcoming14Days.find(d => d.date === dateStr);
    if (dayItem) {
      dayItem.isBlocked = isNowBlocked;
    }
    if (isNowBlocked) {
      if (!this.blockedDatesList.includes(dateStr)) this.blockedDatesList.push(dateStr);
    } else {
      this.blockedDatesList = this.blockedDatesList.filter(d => d !== dateStr);
    }
    this.cdr.detectChanges();

    // 2. Persist to backend database
    const headers = this.authService.getAuthHeaders();
    const payload = {
      date: dateStr,
      status: targetStatus,
      reason: reason || 'ஜோதிடர் விடுப்பு (Busy / Blocked)'
    };

    this.http.post<any>('http://127.0.0.1:8000/api/admin/availability/toggle', payload, headers).subscribe({
      next: () => {
        this.loadAvailabilityData();
      },
      error: () => {
        this.loadAvailabilityData();
        alert('❌ Failed to update date availability.');
      }
    });
  }

  toggleCustomDate(date: string): void {
    if (!date) return;
    const dateStr = String(date).substring(0, 10);
    const isAlreadyBlocked = this.blockedDatesList.includes(dateStr);
    const targetStatus = isAlreadyBlocked ? 'available' : 'busy';
    this.toggleAvailability(dateStr, targetStatus);
    alert(`தேதி (${dateStr}): ${targetStatus === 'busy' ? '🔴 Blocked (முடக்கப்பட்டது)' : '🟢 Free (முன்பதிவுக்கு திறக்கப்பட்டது)'}`);
  }

  deleteAvailabilityRecord(id: number): void {
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/availability/${id}`, headers).subscribe({
      next: () => {
        this.availabilitySuccessMsg = '✅ தேதி முன்பதிவுக்கு திறக்கப்பட்டது (Date Unblocked).';
        this.loadAvailabilityData();
        setTimeout(() => {
          this.availabilitySuccessMsg = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => alert('❌ Failed to unblock date.')
    });
  }

  getBookingCount(status: string): number {
    return this.serviceBookings.filter(b => b.status === status).length;
  }

  getFilteredBookings(): any[] {
    if (this.bookingFilterStatus === 'all') return this.serviceBookings;
    return this.serviceBookings.filter(b => b.status === this.bookingFilterStatus);
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
        this.loadAllData();
      },
      error: () => alert('❌ Failed to update booking status.')
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
        preferred_date: this.manualBookingForm.booking_date,
        query: this.manualBookingForm.query
      }
    };

    this.http.post<any>('http://127.0.0.1:8000/api/bookings/create', payload).subscribe({
      next: (res) => {
        alert(`✅ Booking ${res.order_id} created successfully!`);
        this.manualBookingModalOpen = false;
        this.loadAllData();
      },
      error: (err) => {
        alert(err.error?.message || '❌ Failed to create booking.');
      }
    });
  }

  openViewBookingModal(booking: any): void {
    this.selectedBookingForView = {
      ...booking,
      details: typeof booking.details === 'string' ? JSON.parse(booking.details) : (booking.details || {})
    };
  }

  deleteBooking(bookingId: string, clientName: string): void {
    if (!confirm(`முன்பதிவு #${bookingId} (${clientName}) -ஐ நீக்க விரும்புகிறீர்களா? (Delete Booking)`)) {
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/bookings/${bookingId}`, headers).subscribe({
      next: (res) => {
        alert(res.message || 'முன்பதிவு நீக்கப்பட்டது (Booking Deleted).');
        this.serviceBookings = this.serviceBookings.filter(b => b.id !== bookingId);
        this.cdr.detectChanges();
      },
      error: () => alert('❌ Failed to delete booking.')
    });
  }

  addAdminError = '';
  createAdminLoading = false;

  createAdmin(): void {
    this.addAdminError = '';
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      this.addAdminError = 'Please fill in Name, Email, and Password.';
      return;
    }

    if (!this.newAdmin.email.includes('@') || !this.newAdmin.email.includes('.')) {
      this.addAdminError = 'Please enter a valid email address (e.g. user@example.com).';
      return;
    }

    this.createAdminLoading = true;
    const payload = {
      name: this.newAdmin.name,
      email: this.newAdmin.email,
      password: this.newAdmin.password,
      phone: this.newAdmin.phone || '',
      role: 'admin'
    };

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>('http://127.0.0.1:8000/api/admin/team', payload, headers).subscribe({
      next: () => {
        this.createAdminLoading = false;
        alert('✅ Admin account created successfully!');
        this.openAddAdminModal = false;
        this.newAdmin = { name: '', email: '', password: '', phone: '', role: 'admin' };
        this.addAdminError = '';
        this.loadAllData();
      },
      error: (err) => {
        this.createAdminLoading = false;
        let errorMsg = 'Failed to create admin account.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          errorMsg = err.error.errors[firstKey][0];
        }
        this.addAdminError = errorMsg;
=======
      if (params['tab']) {
        this.currentTab = params['tab'];
>>>>>>> ed937e4ca91df866e421fa7b4b2a4f32408cf74a
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
<<<<<<< HEAD

  // === Dynamic Rasi Palan Management Engine Methods ===

  loadRasiPredictions(): void {
    if (typeof window === 'undefined') return;
    this.rasiPredictionsLoading = true;
    const targetDate = this.selectedRasiDate || new Date().toISOString().split('T')[0];

    this.http.get<any>(`http://127.0.0.1:8000/api/rasi-palan?date=${targetDate}&type=${this.rasiEditorType}`).subscribe({
      next: (res) => {
        this.rasiPredictionsLoading = false;
        if (res && Array.isArray(res.predictions) && res.predictions.length > 0) {
          this.rasiPredictions = this.rasiEditorList.map(r => {
            const found = res.predictions.find((p: any) => p.rasi_name === r.name);
            return {
              rasi_name: r.name,
              prediction_text: found && found.prediction_text ? found.prediction_text : (this.defaultRasiPredictions[r.name] || ''),
              audio_url: found && found.audio_url ? found.audio_url : '',
              video_url: found && found.video_url ? found.video_url : ''
            };
          });
        } else {
          this.resetAllToDefaultsState();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.rasiPredictionsLoading = false;
        this.resetAllToDefaultsState();
        this.cdr.detectChanges();
      }
    });
  }

  changeRasiType(type: string): void {
    this.rasiEditorType = type;
    this.loadRasiPredictions();
  }

  publishRasiPalan(): void {
    const headers = this.authService.getAuthHeaders();
    const targetDate = this.selectedRasiDate || new Date().toISOString().split('T')[0];
    this.rasiPublishing = true;
    this.rasiSaveSuccessMsg = '';

    const payload = {
      date: targetDate,
      type: this.rasiEditorType,
      predictions: this.rasiPredictions
    };

    this.http.put<any>('http://127.0.0.1:8000/api/admin/rasi-palan', payload, headers).subscribe({
      next: () => {
        this.rasiPublishing = false;
        this.rasiSaveSuccessMsg = `✅ All 12 Rasi (${this.rasiEditorType.toUpperCase()}) predictions published successfully! User side (/zodiac) is updated in real-time.`;
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 5000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.rasiPublishing = false;
        alert('❌ Failed to publish predictions. Please check connection.');
        this.cdr.detectChanges();
      }
    });
  }

  saveSingleRasi(index: number): void {
    const item = this.rasiPredictions[index];
    if (!item) return;
    const headers = this.authService.getAuthHeaders();
    const targetDate = this.selectedRasiDate || new Date().toISOString().split('T')[0];

    const payload = {
      date: targetDate,
      type: this.rasiEditorType,
      predictions: [item]
    };

    this.http.put<any>('http://127.0.0.1:8000/api/admin/rasi-palan', payload, headers).subscribe({
      next: () => {
        this.rasiSaveSuccessMsg = `✅ ${item.rasi_name} prediction updated successfully!`;
        setTimeout(() => {
          this.rasiSaveSuccessMsg = '';
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: () => alert(`❌ Failed to save prediction for ${item.rasi_name}.`)
    });
  }

  resetSingleRasi(index: number): void {
    const r = this.rasiEditorList[index];
    if (r && this.defaultRasiPredictions[r.name]) {
      this.rasiPredictions[index].prediction_text = this.defaultRasiPredictions[r.name];
    }
  }

  resetAllToDefaultsState(): void {
    this.rasiPredictions = this.rasiEditorList.map(r => ({
      rasi_name: r.name,
      prediction_text: this.defaultRasiPredictions[r.name] || '',
      audio_url: '',
      video_url: ''
    }));
  }

  resetAllToDefaults(): void {
    if (confirm('Reset all 12 predictions to the default Tamil predictions?')) {
      this.resetAllToDefaultsState();
    }
  }

  openVideoPreview(url: string, rasiName: string): void {
    if (!url) return;
    this.previewVideoUrl = url;
    this.previewVideoTitle = rasiName;

    // Convert YouTube URL if applicable
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
      this.previewVideoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.previewVideoSafeUrl = null;
    }
    this.previewVideoModal = true;
  }

  closeVideoPreview(): void {
    this.previewVideoModal = false;
    this.previewVideoUrl = '';
    this.previewVideoSafeUrl = null;
  }

  testPlayAudio(url: string): void {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.play().catch(e => alert('Cannot play audio: ' + e.message));
    } catch (e) { }
  }

  getMatchCount(type: string): number {
    return this.marriageMatches.filter(m => m.request_type === type).length;
  }

  getFilteredMatches(): any[] {
    if (this.matchFilterType === 'all') return this.marriageMatches;
    return this.marriageMatches.filter(m => {
      if (this.matchFilterType === 'pair_match') {
        return m.request_type !== 'single_search';
      }
      return m.request_type === 'single_search';
    });
  }

  getPoruthamDecisionLabel(status: string): string {
    switch (status) {
      case 'Excellent Match': return '🟢 மிக நல்ல பொருத்தம்';
      case 'Good Match': return '🟢 நல்ல பொருத்தம்';
      case 'Average Match': return '🟡 சுமாரான பொருத்தம்';
      case 'Not Recommended': return '🔴 பொருத்தம் இல்லை';
      case 'Completed': return '✅ முடிவு கூறப்பட்டது';
      case 'Contacted': return '📞 பேசப்பட்டது';
      default: return '⏳ புதிய கோரிக்கை (Pending)';
    }
  }

  getMatrimonyStatusLabel(status: string): string {
    switch (status) {
      case 'Matches Suggested': return '📞 வரன் கூறப்பட்டது (Suggested)';
      case 'Match Finalized': return '✅ வரன் முடிந்தது (Finalized)';
      case 'Searching': return '🔍 வரன் தேடப்படுகிறது';
      case 'Completed': return '✅ நிறைவடைந்தது';
      case 'Contacted': return '📞 பேசப்பட்டது';
      default: return '⏳ புதிய பதிவு (Pending)';
    }
  }

  deleteMatchRecord(id: number, name: string): void {
    if (!confirm(`இந்த பதிவை (#${id} - ${name || ''}) நிச்சயமாக நீக்க வேண்டுமா?`)) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/marriage-matches/${id}`, headers).subscribe({
      next: (res) => {
        alert(res.message || '✅ பதிவு வெற்றிகரமாக நீக்கப்பட்டது!');
        this.selectedMatch = null;
        this.marriageMatches = this.marriageMatches.filter(m => m.id !== id);
        this.cdr.detectChanges();
      },
      error: () => alert('❌ Failed to delete record.')
    });
  }

  viewMatchDetails(match: any): void {
    this.selectedMatch = {
      ...match,
      admin_status: match.admin_status || 'Pending',
      admin_notes: match.admin_notes || ''
    };
    this.matchNotesSaveMsg = '';
  }

  saveMatchConsultationNotes(): void {
    if (!this.selectedMatch) return;
    const headers = this.authService.getAuthHeaders();
    const payload = {
      admin_status: this.selectedMatch.admin_status,
      admin_notes: this.selectedMatch.admin_notes
    };

    this.http.put<any>(`http://127.0.0.1:8000/api/admin/marriage-matches/${this.selectedMatch.id}`, payload, headers).subscribe({
      next: () => {
        this.matchNotesSaveMsg = '✅ ஆலோசனை குறிப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!';
        const idx = this.marriageMatches.findIndex(m => m.id === this.selectedMatch.id);
        if (idx !== -1) {
          this.marriageMatches[idx].admin_status = this.selectedMatch.admin_status;
          this.marriageMatches[idx].admin_notes = this.selectedMatch.admin_notes;
        }
        setTimeout(() => {
          this.matchNotesSaveMsg = '';
          this.cdr.detectChanges();
        }, 3500);
        this.cdr.detectChanges();
      },
      error: () => alert('❌ குறிப்புகளை சேமிக்க முடியவில்லை.')
    });
  }

  openNewLeadModal(): void {
    this.newLeadForm = {
      request_type: 'single_search',
      candidate_gender: 'groom',
      contact_phone: '',
      candidate_name: '',
      candidate_dob: '',
      candidate_rasi: 'மேஷம்',
      candidate_star: '',
      preferences: ''
    };
    this.newLeadModalOpen = true;
  }

  submitManualLead(): void {
    if (!this.newLeadForm.contact_phone || !this.newLeadForm.candidate_name) {
      alert('Please fill contact phone and candidate name.');
      return;
    }
    this.http.post<any>('http://127.0.0.1:8000/api/jathagam/varan-search', this.newLeadForm).subscribe({
      next: (res) => {
        alert(res.message || 'New lead saved!');
        this.newLeadModalOpen = false;
        this.loadAllData();
      },
      error: () => alert('Failed to save lead.')
    });
  }

  sendBroadcast(): void {
    if (!this.broadcastForm.title || !this.broadcastForm.body) {
      alert('Title and body are required.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const payload: any = {
      title: this.broadcastForm.title,
      body: this.broadcastForm.body,
      type: this.broadcastForm.type,
    };
    if (this.broadcastForm.target === 'specific' && this.broadcastForm.user_id) {
      payload.user_id = this.broadcastForm.user_id;
    }
    this.http.post<any>('http://127.0.0.1:8000/api/admin/notifications/broadcast', payload, headers).subscribe({
      next: (res) => {
        this.broadcastMsg = `✅ ${res.message}`;
        this.broadcastForm = { target: 'all', user_id: null, type: 'general', title: '', body: '' };
        setTimeout(() => this.broadcastMsg = '', 4000);
      },
      error: () => { this.broadcastMsg = '❌ Failed to send notification.'; }
    });
  }

  toggleDailyNotification(): void {
    this.dailyNotifLoading = true;
    const headers = this.authService.getAuthHeaders();
    const newEnabled = !this.dailyNotifEnabled;
    this.http.put<any>('http://127.0.0.1:8000/api/admin/notifications/daily-rasi-toggle', { enabled: newEnabled }, headers).subscribe({
      next: (res) => {
        this.dailyNotifEnabled = newEnabled;
        this.dailyNotifLoading = false;
        alert(res.message);
        this.cdr.detectChanges();
      },
      error: () => {
        this.dailyNotifLoading = false;
        alert('Failed to update daily notification setting.');
      }
    });
  }
=======
>>>>>>> ed937e4ca91df866e421fa7b4b2a4f32408cf74a
}
