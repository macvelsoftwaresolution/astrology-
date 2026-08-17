import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

interface Metrics {
  total_students: number;
  total_admins: number;
  total_courses: number;
  total_bookings: number;
  total_book_orders: number;
  total_revenue: number;
  revenue_breakdown: {
    courses: number;
    services: number;
    books: number;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
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

        <!-- TAB 6: ASTROLOGY CONSULTATION APPOINTMENTS -->
        @if (currentTab === 'services') {
          <div class="header-banner">
            <div>
              <h1>Astrology Consultation Appointment Bookings</h1>
              <p>View client appointment requests, Jathagam reading queries, consultation details, and fulfill orders.</p>
            </div>
          </div>

          <!-- Loading Spinner for Appointments -->
          @if (isLoadingServices) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Appointments...</h3>
              <p class="muted" style="margin: 0;">Fetching client astrology appointment bookings and query forms.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (serviceBookings.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Client Name</th>
                      <th>Phone Number</th>
                      <th>Service Type</th>
                      <th>Amount</th>
                      <th>Birth Details & Query</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (b of serviceBookings; track b.id) {
                      <tr>
                        <td><strong>{{ b.id }}</strong></td>
                        <td><strong>{{ b.user_name }}</strong></td>
                        <td>{{ b.user_phone }}</td>
                        <td><span class="badge-role">{{ b.service_type }}</span></td>
                        <td><strong>₹{{ b.price }}</strong></td>
                        <td>
                          @if (b.details) {
                            <div>
                              <small>📅 DOB: {{ b.details.dob || 'N/A' }} | ⏰ TOB: {{ b.details.tob || 'N/A' }}</small><br/>
                              <small>📍 POB: {{ b.details.pob || 'N/A' }}</small><br/>
                              <small class="muted">❓ Query: {{ b.details.query || 'N/A' }}</small>
                            </div>
                          } @else {
                            <span class="muted">No form details</span>
                          }
                        </td>
                        <td>
                          <span class="status-pill" [ngClass]="b.status.toLowerCase()">
                            {{ b.status }}
                          </span>
                        </td>
                        <td>
                          @if (b.status !== 'Completed') {
                            <button 
                              class="btn-primary btn-sm"
                              (click)="fulfillBooking(b.id)"
                            >
                              ✓ Fulfill & Upload Chart
                            </button>
                          }
                          @if (b.status === 'Completed' && b.chart_url) {
                            <a [href]="b.chart_url" target="_blank" class="pdf-link">
                              📄 View Chart
                            </a>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">📅</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Appointment Bookings Found</h3>
                  <p class="muted" style="margin: 0;">No client consultation requests have been booked yet.</p>
                </div>
              }
            </div>
          }
        }

        <!-- TAB 7: RASI PALAN EDITOR -->
        @if (currentTab === 'rasi-editor') {
          <div class="header-banner flex-between">
            <div>
              <h1>🌟 Rasi Palan Editor</h1>
              <p>Update Daily / Weekly / Monthly / Yearly predictions for all 12 Rasis. Saved predictions are visible to all mobile users.</p>
            </div>
            <button class="btn-primary" (click)="publishRasiPalan()">📢 Publish All Predictions</button>
          </div>

          <!-- Tab Type Selector -->
          <div class="rasi-type-bar">
            @for (t of rasiTypes; track t.val) {
              <button [class.active]="rasiEditorType === t.val" (click)="rasiEditorType = t.val">{{ t.label }}</button>
            }
          </div>

          <div class="rasi-editor-grid">
            @for (r of rasiEditorList; track r.name; let i = $index) {
              <div class="rasi-editor-card">
                <div class="rasi-ed-header">
                  <span class="rasi-symbol-ed">{{ r.symbol }}</span>
                  <strong>{{ r.name }}</strong>
                </div>
                <textarea
                  [(ngModel)]="rasiPredictions[i].prediction_text"
                  class="rasi-textarea"
                  rows="4"
                  [placeholder]="r.name + ' ராசிக்கான ' + rasiEditorType + ' பலன்...'"
                ></textarea>
                <div class="audio-row">
                  <label>Audio URL (Optional)</label>
                  <input [(ngModel)]="rasiPredictions[i].audio_url" class="ctrl-sm" placeholder="https://...mp3"/>
                </div>
              </div>
            }
          </div>
        }

        <!-- TAB 8: MARRIAGE MATCH LOG -->
        @if (currentTab === 'matches') {
          <div class="header-banner">
            <div>
              <h1>💑 Marriage Match Requests Log</h1>
              <p>All Porutham matching requests submitted by users on the mobile app.</p>
            </div>
          </div>

          <!-- Loading Spinner for Marriage Matches -->
          @if (isLoadingMatches) {
            <div class="card-box empty-state-box" style="text-align: center; padding: 56px 24px; background: rgba(18, 11, 41, 0.6); border: 1px solid rgba(212, 175, 55, 0.25);">
              <div class="loading-spinner">⏳</div>
              <h3 style="color: #ffd700; margin: 14px 0 6px; font-weight: 700;">Loading Marriage Matches...</h3>
              <p class="muted" style="margin: 0;">Fetching client Porutham matching logs.</p>
            </div>
          } @else {
            <div class="card-box">
              @if (marriageMatches.length > 0) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Requested By</th>
                      <th>Boy Name & Rasi</th>
                      <th>Girl Name & Rasi</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of marriageMatches; track m.id) {
                      <tr>
                        <td><strong>#{{ m.id }}</strong></td>
                        <td>{{ m.requester_name || 'Guest' }}</td>
                        <td>
                          <strong>{{ m.boy_name }}</strong>
                          <div class="muted">{{ m.boy_rasi }} | {{ m.boy_nakshatra }}</div>
                        </td>
                        <td>
                          <strong>{{ m.girl_name }}</strong>
                          <div class="muted">{{ m.girl_rasi }} | {{ m.girl_nakshatra }}</div>
                        </td>
                        <td>
                          <span class="score-badge" [class.good]="m.match_score >= 6" [class.bad]="m.match_score < 6">
                            {{ m.match_score }}/10
                          </span>
                        </td>
                        <td>
                          <span class="status-pill" [class.completed]="m.match_status === 'Match'" [class.pending]="m.match_status !== 'Match'">
                            {{ m.match_status === 'Match' ? '✅ Match' : '❌ No Match' }}
                          </span>
                        </td>
                        <td>{{ m.created_at | date:'dd MMM yyyy' }}</td>
                        <td>
                          <button class="btn-sm" (click)="viewMatchDetails(m)">View Details</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div style="text-align: center; padding: 40px 20px;">
                  <div style="font-size: 38px; margin-bottom: 10px;">💑</div>
                  <h3 style="color: #fff; margin: 0 0 6px;">No Marriage Match Logs Found</h3>
                  <p class="muted" style="margin: 0;">No Porutham match requests submitted by mobile users yet.</p>
                </div>
              }
            </div>
          }

          <!-- Match Detail Modal -->
          @if (selectedMatch) {
            <div class="modal-overlay">
              <div class="modal-box" style="max-width:520px">
                <div class="modal-header">
                  <h3>{{ selectedMatch.boy_name }} ↔ {{ selectedMatch.girl_name }}</h3>
                  <button class="close-btn" (click)="selectedMatch = null">✕</button>
                </div>
                <div class="match-score-row">
                  <span class="big-score-badge" [class.good]="selectedMatch.match_score >= 6">{{ selectedMatch.match_score }}/10</span>
                  <span class="match-verdict">{{ selectedMatch.match_status }}</span>
                </div>
                <div class="breakdown-table">
                  @for (d of selectedMatch.match_details; track $index) {
                    <div class="breakdown-row">
                      <span>{{ d.name }}</span>
                      <span [class.match-yes]="d.result === 'Match'" [class.match-no]="d.result !== 'Match'">
                        {{ d.result === 'Match' ? '✅' : '❌' }} {{ d.result }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }

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

    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      min-height: 100vh;
      background: #090614;
      color: #e0e0ff;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    /* LEFT SIDEBAR STYLING */
    .sidebar {
      width: 270px;
      background: #120b29;
      border-right: 1px solid rgba(212, 175, 55, 0.15);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand .icon { font-size: 26px; }
    .brand h2 { font-size: 20px; color: #ffd700; margin: 0; font-weight: 700; }
    .brand-sub { font-size: 11px; color: #8a8ab0; }

    .drawer-close-btn {
      display: none;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
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
      background: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 24px;
      flex: 1;
    }

    .nav-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 10px;
      color: #a0a0c0;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-menu button.active {
      background: rgba(212, 175, 55, 0.18);
      border-color: rgba(212, 175, 55, 0.5);
      color: #ffd700;
      font-weight: 700;
    }

    @media (hover: hover) {
      .nav-menu button:hover:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }
    }

    .nav-icon { font-size: 16px; }

    .user-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
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
      background: linear-gradient(135deg, #ffd700, #aa7c11);
      color: #000; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .u-details { flex: 1; overflow: hidden; }
    .u-name { display: block; font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .u-role { font-size: 9px; color: #ffd700; letter-spacing: 0.5px; }

    .btn-logout-full {
      width: 100%;
      padding: 10px;
      background: rgba(239, 68, 68, 0.18);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn-logout-full:hover {
      background: rgba(239, 68, 68, 0.35);
      border-color: #ef4444;
      color: #fff;
    }

    /* MAIN PANEL */
    .main-panel {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }

    .header-banner {
      margin-bottom: 28px;
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-banner h1 { font-size: 24px; margin: 0 0 4px 0; color: #fff; }
    .header-banner p { margin: 0; color: #8a8ab0; font-size: 13px; }

    .btn-primary {
      padding: 10px 18px;
      background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
      border: none;
      border-radius: 8px;
      color: #0d0722;
      font-weight: 700;
      cursor: pointer;
    }

    /* METRICS & CARDS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .metric-card {
      background: rgba(23, 15, 48, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
    }

    .metric-card.gold { border-color: rgba(212, 175, 55, 0.4); }
    .metric-card.blue { border-color: rgba(99, 102, 241, 0.4); }
    .metric-card.purple { border-color: rgba(168, 85, 247, 0.4); }
    .metric-card.green { border-color: rgba(34, 197, 94, 0.4); }

    .metric-card .icon { font-size: 26px; margin-bottom: 6px; }
    .metric-card .val { font-size: 24px; font-weight: 700; color: #fff; }
    .metric-card .lbl { font-size: 12px; color: #8a8ab0; margin-top: 4px; }

    .analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card-box {
      background: rgba(23, 15, 48, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
    }

    .card-box h3 { margin: 0 0 16px 0; font-size: 16px; color: #fff; }

    .ledger-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13px;
    }

    .team-mini-list { display: flex; flex-direction: column; gap: 10px; }
    .mini-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; }
    .mini-avatar { width: 32px; height: 32px; border-radius: 50%; background: #ffd700; color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; }
    .mini-info { flex: 1; }
    .mini-info strong { display: block; font-size: 13px; color: #fff; }
    .mini-info small { font-size: 11px; color: #8a8ab0; }

    .status.active { color: #4ade80; font-size: 11px; }
    .status.suspended { color: #f87171; font-size: 11px; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; }
    .data-table th { color: #8a8ab0; font-size: 11px; text-transform: uppercase; }

    .badge-role { background: rgba(212, 175, 55, 0.2); color: #ffd700; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-pill.shipped, .status-pill.completed { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .status-pill.processing, .status-pill.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .status-pill.approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; }

    .badge-type { background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 11px; }
    .badge-type.courier { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }

    .pdf-link { color: #60a5fa; font-size: 12px; text-decoration: none; font-weight: 600; }

    .btn-sm { padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .btn-sm.danger { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
    .course-card { background: #160f33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; }
    .card-image { height: 150px; background-size: cover; background-position: center; position: relative; padding: 12px; }
    .badge-price { position: absolute; top: 12px; right: 12px; background: #ffd700; color: #000; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    .card-content { padding: 18px; }
    .level-tag { font-size: 10px; color: #a855f7; background: rgba(168, 85, 247, 0.15); padding: 2px 8px; border-radius: 4px; }
    .card-content h4 { margin: 8px 0; font-size: 16px; color: #fff; }

    .modules-container { margin-top: 14px; background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 10px; }
    .module-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; }
    .btn-xs { padding: 4px 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 4px; font-size: 11px; cursor: pointer; }

    .module-box { background: rgba(255, 255, 255, 0.04); padding: 8px; border-radius: 8px; margin-bottom: 6px; }
    .mod-title { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #ffd700; margin-bottom: 6px; }

    .lessons-list { display: flex; flex-direction: column; gap: 4px; }
    .lesson-chip { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 6px; font-size: 11px; }
    .les-link { color: #60a5fa; text-decoration: none; font-size: 11px; }

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
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box { background: #170f30; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 24px; width: 100%; max-width: 440px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 11px; color: #8a8ab0; margin-bottom: 4px; }
    .ctrl { width: 100%; box-sizing: border-box; padding: 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }
    .modal-btns { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .btn-cancel { padding: 8px 14px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; cursor: pointer; }

    /* ULTRA PROFESSIONAL MODAL STYLES */
    .modal-box-pro { background: rgba(18, 11, 41, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(212, 175, 55, 0.15); width: 100%; max-width: 520px; padding: 28px; box-sizing: border-box; animation: modalPopIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes modalPopIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    .modal-header-pro { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 14px; }
    .modal-header-pro h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #ffd700; }
    .modal-sub { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4; }
    .close-btn-pro { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #a0a0c0; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .close-btn-pro:hover { background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.5); color: #fca5a5; }
    .modal-alert-error { margin-bottom: 16px; font-size: 12px; padding: 10px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; border-radius: 10px; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .thumb-preview-box { margin-top: 8px; height: 110px; background-size: cover; background-position: center; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.3); position: relative; overflow: hidden; }
    .preview-badge { position: absolute; bottom: 6px; right: 6px; background: rgba(0, 0, 0, 0.7); color: #ffd700; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; backdrop-filter: blur(4px); }
    .modal-btns-pro { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
    .btn-cancel-pro { padding: 10px 18px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.18); color: #cbd5e1; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
    .btn-cancel-pro:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }

    /* CLEAN COURSE CARD & WIZARD STYLES */
    .loading-spinner { font-size: 38px; display: inline-block; animation: spinPulse 1.2s infinite ease-in-out; }
    @keyframes spinPulse { 0% { transform: scale(1) rotate(0deg); opacity: 0.7; } 50% { transform: scale(1.15) rotate(180deg); opacity: 1; } 100% { transform: scale(1) rotate(360deg); opacity: 0.7; } }
    .course-summary-stats-bar { display: flex; gap: 12px; margin: 14px 0 16px 0; padding: 10px 14px; background: rgba(10, 6, 24, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; }
    .stat-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; }
    .stat-pill strong { color: #ffd700; }
    .course-actions-bar { display: flex; gap: 10px; align-items: center; margin-top: auto; }
    .btn-icon-danger { padding: 8px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-icon-danger:hover { background: #ef4444; color: #fff; }
    .flex-1 { flex: 1; }
    .flex-gap { display: flex; gap: 8px; align-items: center; }

    /* WIZARD & DRAWER MODALS */
    .syllabus-drawer-box, .wizard-modal-box { max-width: 680px !important; }
    .drawer-course-summary-row { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
    .drawer-actions-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 10px; margin-bottom: 14px; }
    .drawer-modules-scroll-area { max-height: 380px; overflow-y: auto; padding-right: 4px; }
    .wizard-steps-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding: 12px; background: rgba(0, 0, 0, 0.4); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); }
    .wizard-step-item { display: flex; align-items: center; gap: 8px; cursor: pointer; opacity: 0.6; transition: all 0.2s; }
    .wizard-step-item.active, .wizard-step-item.completed { opacity: 1; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .wizard-step-item.active .step-num { background: #ffd700; color: #000; border-color: #ffd700; }
    .wizard-step-item.completed .step-num { background: #22c55e; color: #fff; border-color: #22c55e; }
    .step-title { font-size: 12px; font-weight: 600; color: #e2e8f0; }
    .step-connector { flex: 1; height: 2px; background: rgba(255, 255, 255, 0.1); margin: 0 8px; }
    .step-connector.active { background: #ffd700; }
    .wizard-step-body { margin-bottom: 20px; min-height: 220px; }
    /* Phase 4 New Admin Styles */
    .rasi-type-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .rasi-type-bar button { padding: 6px 16px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; color: #ccc; font-size: 12px; cursor: pointer; }
    .rasi-type-bar button.active { background: rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.4); color: #ffd700; font-weight: 700; }

    .rasi-editor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .rasi-editor-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; }
    .rasi-ed-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rasi-symbol-ed { font-size: 24px; }
    .rasi-editor-card strong { color: #ffd700; font-size: 14px; }
    .rasi-textarea { width: 100%; box-sizing: border-box; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 12px; padding: 10px; resize: vertical; font-family: inherit; }
    .audio-row { margin-top: 8px; }
    .audio-row label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 3px; }
    .ctrl-sm { width: 100%; box-sizing: border-box; padding: 7px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; font-size: 11px; }

    .score-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
    .score-badge.good { background: rgba(34,197,94,0.2); color: #4ade80; }
    .score-badge.bad { background: rgba(239,68,68,0.2); color: #f87171; }

    .match-score-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px; }
    .big-score-badge { font-size: 28px; font-weight: 800; background: rgba(34,197,94,0.2); color: #4ade80; padding: 8px 16px; border-radius: 12px; }
    .big-score-badge.good { background: rgba(34,197,94,0.2); color: #4ade80; }
    .match-verdict { font-size: 16px; color: #fff; font-weight: 600; }
    .breakdown-table { display: flex; flex-direction: column; gap: 6px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border-radius: 6px; font-size: 13px; }
    .match-yes { color: #4ade80; }
    .match-no { color: #f87171; }

    .success-msg { color: #4ade80; font-size: 13px; margin-top: 10px; }
    .muted { color: #8a8ab0; font-size: 12px; }
    .address-col { max-width: 160px; font-size: 11px; }

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
        background: #120b29;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        position: sticky;
        top: 0;
        z-index: 990;
      }

      .mobile-topbar .brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mobile-topbar .brand .icon { font-size: 22px; }
      .mobile-topbar .brand h2 {
        font-size: 18px;
        color: #ffd700;
        margin: 0;
        font-weight: 700;
      }

      .hamburger-btn {
        background: rgba(212, 175, 55, 0.15);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #ffd700;
        padding: 8px 14px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .hamburger-btn:active {
        background: #ffd700;
        color: #000;
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
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.8);
        border-right: 1px solid rgba(212, 175, 55, 0.3);
        background: #120b29;
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
        background: rgba(0, 0, 0, 0.65);
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
})

export class AdminDashboardComponent implements OnInit {
  currentTab = 'overview';
  currentUser: User | null = null;
  mobileMenuOpen = false;

  selectTab(tab: string): void {
    this.currentTab = tab;
    this.mobileMenuOpen = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    this.loadActiveTabData(tab);
  }


  metrics: Metrics | null = null;
  teamList: any[] = [];
  courses: any[] = [];
  bookOrders: any[] = [];
  submissions: any[] = [];
  serviceBookings: any[] = [];

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

  // Rasi Palan Editor
  rasiEditorType = 'daily';
  rasiTypes = [
    { label: 'Daily', val: 'daily' },
    { label: 'Weekly', val: 'weekly' },
    { label: 'Monthly', val: 'monthly' },
    { label: 'Yearly', val: 'yearly' }
  ];
  rasiEditorList = [
    { name: 'மேஷம்', symbol: '♈' }, { name: 'ரிஷபம்', symbol: '♉' },
    { name: 'மிதுனம்', symbol: '♊' }, { name: 'கடகம்', symbol: '♋' },
    { name: 'சிம்மம்', symbol: '♌' }, { name: 'கன்னி', symbol: '♍' },
    { name: 'துலாம்', symbol: '♎' }, { name: 'விருச்சிகம்', symbol: '♏' },
    { name: 'தனுசு', symbol: '♐' }, { name: 'மகரம்', symbol: '♑' },
    { name: 'கும்பம்', symbol: '♒' }, { name: 'மீனம்', symbol: '♓' }
  ];
  rasiPredictions: { rasi_name: string; prediction_text: string; audio_url: string }[] = this.rasiEditorList.map(r => ({
    rasi_name: r.name, prediction_text: '', audio_url: ''
  }));

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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const initialTab = this.route.snapshot?.queryParams?.['tab'];
    if (initialTab) {
      this.currentTab = initialTab;
    }
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.currentUser = this.authService.getUser();

    this.route.queryParams.subscribe(params => {
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

        default:
          break;
      }
    }, 0);
  }

  loadAllData(): void {
    if (typeof window === 'undefined') return;
    this.loadActiveTabData(this.currentTab);
  }

  fulfillBooking(bookingId: string): void {
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/bookings/${bookingId}/fulfill`, { chart_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, headers).subscribe({
      next: (res) => {
        alert('Booking fulfilled successfully!');
        this.loadAllData();
      }
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
        this.cdr.detectChanges();
      }
    });
  }

  toggleAdminStatus(id: number): void {
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/team/${id}/toggle`, {}, headers).subscribe({
      next: () => this.loadAllData()
    });
  }

  createCourse(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>('http://127.0.0.1:8000/api/admin/courses', this.newCourse, headers).subscribe({
      next: () => {
        this.openCourseModal = false;
        this.loadAllData();
      }
    });
  }

  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`http://127.0.0.1:8000/api/admin/courses/${id}`, headers).subscribe({
      next: () => {
        alert('Course deleted successfully!');
        this.loadAllData();
      },
      error: () => {
        alert('Failed to delete course.');
      }
    });
  }

  selectCourseForModule(courseId: number): void {
    this.selectedCourseIdForModule = courseId;
    this.openModuleModal = true;
  }

  addModule(): void {
    if (!this.selectedCourseIdForModule || !this.newModuleTitle) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/courses/${this.selectedCourseIdForModule}/modules`, { title: this.newModuleTitle }, headers).subscribe({
      next: () => {
        this.openModuleModal = false;
        this.newModuleTitle = '';
        this.loadAllData();
      }
    });
  }

  selectModuleForLesson(moduleId: number): void {
    this.selectedModuleIdForLesson = moduleId;
    this.openLessonModal = true;
  }

  addLesson(): void {
    if (!this.selectedModuleIdForLesson || !this.newLesson.title) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/modules/${this.selectedModuleIdForLesson}/lessons`, this.newLesson, headers).subscribe({
      next: () => {
        this.openLessonModal = false;
        this.newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };
        this.loadAllData();
      }
    });
  }

  openCourierUpdate(order: any): void {
    this.selectedOrderForCourier = order;
    this.courierForm = {
      status: order.status,
      courier_partner: order.courier_partner || 'Blue Dart',
      awb_number: order.awb_number || ''
    };
  }

  saveCourierStatus(): void {
    if (!this.selectedOrderForCourier) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/book-orders/${this.selectedOrderForCourier.id}/courier`, this.courierForm, headers).subscribe({
      next: () => {
        this.selectedOrderForCourier = null;
        this.loadAllData();
      }
    });
  }

  openGradingModal(sub: any): void {
    this.selectedSubmissionForGrading = sub;
    this.gradingForm = {
      score: sub.score || 85,
      status: sub.status === 'Pending' ? 'Approved' : sub.status,
      evaluator_notes: sub.evaluator_notes || ''
    };
  }

  saveGrading(): void {
    if (!this.selectedSubmissionForGrading) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/submissions/${this.selectedSubmissionForGrading.id}/evaluate`, this.gradingForm, headers).subscribe({
      next: (res) => {
        alert(res.message + (res.certificate_issued ? ' E-Certificate issued successfully!' : ''));
        this.selectedSubmissionForGrading = null;
        this.loadAllData();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // === Phase 4 New Methods ===

  publishRasiPalan(): void {
    const headers = this.authService.getAuthHeaders();
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      date: today,
      type: this.rasiEditorType,
      predictions: this.rasiPredictions
    };
    this.http.put<any>('http://127.0.0.1:8000/api/admin/rasi-palan', payload, headers).subscribe({
      next: () => alert(`✅ All 12 Rasi ${this.rasiEditorType} predictions published successfully!`),
      error: () => alert('❌ Failed to publish predictions.')
    });
  }

  viewMatchDetails(match: any): void {
    this.selectedMatch = {
      ...match,
      match_details: Array.isArray(match.match_details) ? match.match_details : []
    };
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
}
