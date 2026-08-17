import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
      <div *ngIf="mobileMenuOpen" class="mobile-backdrop" (click)="mobileMenuOpen = false"></div>

      <!-- MAIN CONTENT PANEL -->
      <main class="main-panel">
        
        <!-- TAB 1: OVERVIEW & ANALYTICS -->
        <div *ngIf="currentTab === 'overview'">
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
                <div *ngFor="let member of teamList" class="mini-item">
                  <div class="mini-avatar">{{ member.name.charAt(0) }}</div>
                  <div class="mini-info">
                    <strong>{{ member.name }}</strong>
                    <small>{{ member.email }}</small>
                  </div>
                  <span [class]="member.status === 'active' ? 'status active' : 'status suspended'">
                    {{ member.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: TEAM & ASTROLOGERS MANAGEMENT -->
        <div *ngIf="currentTab === 'team'">
          <div class="header-banner flex-between">
            <div>
              <h1>Admin & Astrologer Management</h1>
              <p>Add team members, configure system privileges, and control account activity.</p>
            </div>
            <button class="btn-primary" (click)="openAddAdminModal = true">+ Create Admin Account</button>
          </div>

          <div class="card-box">
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
                <tr *ngFor="let adm of teamList">
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
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: LEARN & COURSE STUDIO -->
        <div *ngIf="currentTab === 'lms'">
          <div class="header-banner flex-between">
            <div>
              <h1>Course & Syllabus Management Studio</h1>
              <p>Create courses, structure syllabus modules, attach audio/video lessons, upload PDFs, and set live links.</p>
            </div>
            <button class="btn-primary" (click)="openCourseModal = true">+ Create New Course</button>
          </div>

          <div class="courses-grid">
            <div *ngFor="let course of courses" class="course-card">
              <div class="card-image" [style.background-image]="'url(' + course.thumbnail + ')'">
                <span class="badge-price">₹{{ course.price }}</span>
              </div>
              <div class="card-content">
                <span class="level-tag">{{ course.level }}</span>
                <h4>{{ course.title }}</h4>
                <p>{{ course.description }}</p>

                <!-- Modules Accordion -->
                <div class="modules-container">
                  <div class="module-header">
                    <strong>Syllabus Modules ({{ course.modules?.length || 0 }})</strong>
                    <button class="btn-xs" (click)="selectCourseForModule(course.id)">+ Add Module</button>
                  </div>

                  <div *ngFor="let mod of course.modules" class="module-box">
                    <div class="mod-title">
                      <span>📌 {{ mod.title }}</span>
                      <button class="btn-xs" (click)="selectModuleForLesson(mod.id)">+ Add Lesson</button>
                    </div>

                    <!-- Lessons List -->
                    <div class="lessons-list">
                      <div *ngFor="let les of mod.lessons" class="lesson-chip">
                        <span class="type-icon" [ngSwitch]="les.content_type">
                          <i *ngSwitchCase="'video'">🎥 Video</i>
                          <i *ngSwitchCase="'audio'">🎵 Audio</i>
                          <i *ngSwitchCase="'pdf'">📄 PDF</i>
                          <i *ngSwitchCase="'live_link'">🔴 Live Link</i>
                          <i *ngSwitchDefault>📝 Content</i>
                        </span>
                        <span class="les-name">{{ les.title }}</span>
                        <a [href]="les.content_url" target="_blank" class="les-link">View Media</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: COURIER & BOOK ORDERS -->
        <div *ngIf="currentTab === 'courier'">
          <div class="header-banner">
            <div>
              <h1>Physical Book Orders & Courier Logistics</h1>
              <p>Fulfill book orders, assign courier partners (DTDC, Blue Dart), and update AWB tracking status.</p>
            </div>
          </div>

          <div class="card-box">
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
                <tr *ngFor="let order of bookOrders">
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
                    <div *ngIf="order.awb_number">
                      <strong>{{ order.courier_partner || 'Courier' }}</strong>
                      <div>AWB: {{ order.awb_number }}</div>
                    </div>
                    <span *ngIf="!order.awb_number" class="muted">Pending Tracking</span>
                  </td>
                  <td>
                    <button class="btn-sm" (click)="openCourierUpdate(order)">Update Courier AWB</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 5: EXAM VALUATION & E-CERTIFICATES -->
        <div *ngIf="currentTab === 'grading'">
          <div class="header-banner">
            <div>
              <h1>Student Exam Valuation & E-Certificate Generator</h1>
              <p>Evaluate PDF uploads & physical courier answer papers ("Eluthi PDF send"). Passing marks (≥60) auto-issue E-Certificates.</p>
            </div>
          </div>

          <div class="card-box">
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
                <tr *ngFor="let sub of submissions">
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
                    <div *ngIf="sub.pdf_url">
                      <a [href]="sub.pdf_url" target="_blank" class="pdf-link">📄 Open Answer Sheet PDF</a>
                    </div>
                    <div *ngIf="sub.courier_tracking_no">
                      <strong>Courier:</strong> {{ sub.courier_name }}<br/>
                      <strong>Tracking:</strong> {{ sub.courier_tracking_no }}
                    </div>
                  </td>
                  <td>
                    <strong *ngIf="sub.score !== null">{{ sub.score }}/100</strong>
                    <span *ngIf="sub.score === null" class="muted">Not Graded</span>
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
              </tbody>
            </table>
          </div>
        </div>

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
        <div *ngIf="currentTab === 'rasi-editor'">
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

          <!-- Loading Indicator -->
          <div *ngIf="rasiPredictionsLoading" class="center-loader-box">
            <p>⏳ Loading Rasi Palan predictions from database...</p>
          </div>

          <!-- 12 Rasi Editor Cards Grid -->
          <div *ngIf="!rasiPredictionsLoading" class="rasi-editor-grid">
            <div *ngFor="let r of rasiEditorList; let i = index" class="rasi-editor-card">
              <div class="rasi-ed-header">
                <div class="rasi-left-meta">
                  <span class="rasi-symbol-ed">{{ r.symbol }}</span>
                  <div class="rasi-title-group">
                    <strong class="rasi-tamil-title">{{ r.name }}</strong>
                    <span class="rasi-eng-sub">{{ r.englishName }} &bull; {{ r.dates }}</span>
                  </div>
                </div>
                <div class="card-top-actions">
                  <button class="btn-card-save" (click)="saveSingleRasi(i)" title="Save only this Rasi">
                    💾 Save
                  </button>
                </div>
              </div>

              <div class="form-group-rasi">
                <div class="textarea-header">
                  <label>{{ r.name }} {{ rasiEditorType | titlecase }} பலன் (Prediction Text):</label>
                  <span class="char-count">{{ (rasiPredictions[i]?.prediction_text || '').length }} chars</span>
                </div>
                <textarea
                  [(ngModel)]="rasiPredictions[i].prediction_text"
                  class="rasi-textarea"
                  rows="4"
                  [placeholder]="r.name + ' (' + r.englishName + ') ராசிக்கான ' + rasiEditorType + ' பலன் உள்ளிடவும்...'"
                ></textarea>
              </div>

              <!-- Audio Prediction Stream Input -->
              <div class="media-input-box audio-box">
                <label class="media-lbl">
                  <span class="media-icon">🎙️</span> 
                  <strong>ஆடியோ பலன் (Audio Stream URL - Optional):</strong>
                </label>
                <div class="media-input-row">
                  <input 
                    [(ngModel)]="rasiPredictions[i].audio_url" 
                    class="ctrl-sm" 
                    placeholder="https://example.com/audio/mesham.mp3"
                  />
                  <button 
                    *ngIf="rasiPredictions[i].audio_url" 
                    type="button"
                    class="btn-audio-test" 
                    (click)="testPlayAudio(rasiPredictions[i].audio_url)"
                    title="Play Audio">
                    ▶ Play
                  </button>
                </div>
              </div>

              <!-- Video Horoscope / YouTube Stream Input -->
              <div class="media-input-box video-box">
                <label class="media-lbl video-lbl">
                  <span class="media-icon">🎬</span> 
                  <strong>வீடியோ பலன் (Video URL / YouTube - Optional):</strong>
                </label>
                <div class="media-input-row">
                  <input 
                    [(ngModel)]="rasiPredictions[i].video_url" 
                    class="ctrl-sm" 
                    placeholder="https://www.youtube.com/watch?v=... அல்லது MP4 வீடியோ லிங்க்"
                  />
                  <button 
                    *ngIf="rasiPredictions[i].video_url" 
                    type="button"
                    class="btn-video-test" 
                    (click)="openVideoPreview(rasiPredictions[i].video_url, r.name)"
                    title="Preview Video">
                    👁️ Preview Video
                  </button>
                </div>
                <span class="video-hint-text">💡 YouTube / MP4 வீடியோ சேர்த்தால் User Side (/zodiac)-ல் வீடியோ பிளேயர் தோன்றும்.</span>
              </div>

              <div class="card-footer-mini">
                <button class="btn-link-reset" (click)="resetSingleRasi(i)">
                  ↺ Reset Default
                </button>
                <span class="status-dot-live">● Live Sync</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 8: MARRIAGE MATCH & MATRIMONY CONSULTATION LOG -->
        <div *ngIf="currentTab === 'matches'">
          
          <!-- TOP MAIN HEADER BANNER WITH ACTION BUTTONS -->
          <div class="header-banner flex-between" style="background:#ffffff;border:1px solid #e2e8f0;padding:20px 24px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.03);margin-bottom:20px;">
            <div>
              <h1 style="font-size:22px;margin:0 0 6px 0;color:#0f172a;display:flex;align-items:center;gap:8px;">
                <span>💑</span> திருமணப் பொருத்தம் & வரன் தேடல் மேலாண்மை
              </h1>
              <p style="margin:0;color:#64748b;font-size:13px;">
                இருவர் ஜாதகப் பொருத்தம் (Pair Match) மற்றும் வரன் தேடல் (Looking for Bride / Groom) கோரிக்கைகள் & தொலைபேசி ஆலோசனை.
              </p>
            </div>
            
            <!-- TOP PROMINENT ACTION BUTTONS -->
            <div class="header-actions-group" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <button 
                type="button" 
                class="btn-primary" 
                [style.opacity]="matchFilterType === 'pair_match' ? '1' : '0.85'"
                style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);color:#ffffff;box-shadow:0 3px 10px rgba(37,99,235,0.25);border:none;padding:10px 18px;font-size:13px;font-weight:700;border-radius:10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;"
                (click)="matchFilterType = 'pair_match'"
              >
                <span>💑</span> இருவர் பொருத்தம் (Pair Match)
              </button>

              <button 
                type="button" 
                class="btn-primary" 
                [style.opacity]="matchFilterType === 'single_search' ? '1' : '0.85'"
                style="background:linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);color:#ffffff;box-shadow:0 3px 10px rgba(147,51,234,0.25);border:none;padding:10px 18px;font-size:13px;font-weight:700;border-radius:10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;"
                (click)="matchFilterType = 'single_search'"
              >
                <span>🔍</span> வரன் தேடல் (Looking for Bride/Groom)
              </button>

              <button 
                type="button" 
                class="btn-primary" 
                style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);padding:10px 18px;font-size:13px;font-weight:700;border-radius:10px;display:inline-flex;align-items:center;gap:6px;"
                (click)="openNewLeadModal()"
              >
                <span>➕</span> புதிய வரன் பதிவு (Add Lead)
              </button>
            </div>
          </div>

          <!-- Filter Sub-Tabs Bar -->
          <div class="rasi-controls-bar" style="margin-bottom:16px;">
            <div class="rasi-type-bar">
              <button [class.active]="matchFilterType === 'all'" (click)="matchFilterType = 'all'">
                அனைத்தும் ({{ marriageMatches.length }})
              </button>
              <button [class.active]="matchFilterType === 'pair_match'" (click)="matchFilterType = 'pair_match'">
                💑 இருவர் பொருத்தம் ({{ getMatchCount('pair_match') }})
              </button>
              <button [class.active]="matchFilterType === 'single_search'" (click)="matchFilterType = 'single_search'">
                🔍 வரன் தேடல் / மணமகன்-மணமகள் தேவை ({{ getMatchCount('single_search') }})
              </button>
            </div>
            <div class="status-summary-hint">
              <span class="muted">💡 பயனரின் ஜாதக விவரங்களை ஆய்வு செய்து தொலைபேசி வழியே ஆலோசனை வழங்கலாம்.</span>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="getFilteredMatches().length === 0" class="card-box text-center py-5">
            <p class="muted">எந்த கோரிக்கைகளும் இல்லை.</p>
          </div>

          <!-- Matches / Leads Table -->
          <div *ngIf="getFilteredMatches().length > 0" class="card-box">
            <table class="data-table">
              <thead>
                <tr>
                  <th>கோரிக்கை ID</th>
                  <th>வகை (Type)</th>
                  <th>பயனர் / தொடர்பு (Requester Contact)</th>
                  <th>மணமகன் விவரம் (Boy Details)</th>
                  <th>மணமகள் / எதிர்பார்ப்பு (Girl / Preference)</th>
                  <th>ஆலோசனை நிலை (Status)</th>
                  <th>தேதி</th>
                  <th>செயல்கள்</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of getFilteredMatches()">
                  <td><strong>#{{ m.id }}</strong></td>
                  <td>
                    <span *ngIf="m.request_type !== 'single_search'" class="badge-role" style="background:#eff6ff;color:#2563eb;border-color:#bfdbfe;">
                      💑 இருவர் பொருத்தம்
                    </span>
                    <span *ngIf="m.request_type === 'single_search'" class="badge-role" style="background:#fdf4ff;color:#c026d3;border-color:#f5d0fe;">
                      🔍 {{ m.candidate_gender === 'groom' ? '🤵 மணமகன் தேவை' : '👰 மணமகள் தேவை' }}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:#0f172a;">{{ m.requester_display || m.requester_name || 'பதிவு செய்த பயனர்' }}</div>
                    <div *ngIf="m.contact_phone || m.requester_phone" class="phone-contact-row" style="margin-top:4px;display:flex;gap:6px;align-items:center;">
                      <a [href]="'tel:' + (m.contact_phone || m.requester_phone)" class="btn-tel-call" title="Call Requester">
                        📞 {{ m.contact_phone || m.requester_phone }}
                      </a>
                      <a [href]="'https://wa.me/91' + (m.contact_phone || m.requester_phone)" target="_blank" class="btn-wa-link" title="WhatsApp Message">
                        💬 WA
                      </a>
                    </div>
                  </td>
                  <td>
                    <!-- If Pair Match or Boy Profile -->
                    <div *ngIf="m.boy_name">
                      <strong style="color:#0f172a;">{{ m.boy_name }}</strong>
                      <div class="muted" style="font-size:11px;">
                        {{ m.boy_dob | date:'dd MMM yyyy' }} {{ m.boy_tob ? '• ' + m.boy_tob : '' }}
                      </div>
                      <div style="font-size:11px;color:#b45309;font-weight:600;">
                        {{ m.boy_rasi || '-' }} | {{ m.boy_nakshatra || '-' }}
                      </div>
                      <div *ngIf="m.boy_pob" class="muted" style="font-size:10px;">இடம்: {{ m.boy_pob }}</div>
                    </div>
                    <div *ngIf="!m.boy_name" class="muted" style="font-size:11px;">-</div>
                  </td>
                  <td>
                    <!-- If Pair Match: Girl Details -->
                    <div *ngIf="m.request_type !== 'single_search' && m.girl_name">
                      <strong style="color:#0f172a;">{{ m.girl_name }}</strong>
                      <div class="muted" style="font-size:11px;">
                        {{ m.girl_dob | date:'dd MMM yyyy' }} {{ m.girl_tob ? '• ' + m.girl_tob : '' }}
                      </div>
                      <div style="font-size:11px;color:#b45309;font-weight:600;">
                        {{ m.girl_rasi || '-' }} | {{ m.girl_nakshatra || '-' }}
                      </div>
                      <div *ngIf="m.girl_pob" class="muted" style="font-size:10px;">இடம்: {{ m.girl_pob }}</div>
                    </div>
                    <!-- If Single Search: Girl Profile or Preferences -->
                    <div *ngIf="m.request_type === 'single_search'">
                      <div *ngIf="m.girl_name">
                        <strong style="color:#0f172a;">{{ m.girl_name }}</strong>
                        <div class="muted" style="font-size:11px;">{{ m.girl_dob | date:'dd MMM yyyy' }} • {{ m.girl_rasi }} | {{ m.girl_nakshatra }}</div>
                      </div>
                      <div *ngIf="m.preferences" style="font-size:11px;color:#475569;background:#f8fafc;padding:4px 8px;border-radius:6px;margin-top:2px;">
                        <strong>எதிர்பார்ப்பு:</strong> {{ m.preferences }}
                      </div>
                      <div *ngIf="m.education_job" class="muted" style="font-size:10px;margin-top:2px;">
                        கல்வி/வேலை: {{ m.education_job }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" 
                      [class.completed]="m.admin_status === 'Completed' || m.admin_status === 'Consultation Done'"
                      [class.processing]="m.admin_status === 'Contacted'"
                      [class.pending]="!m.admin_status || m.admin_status === 'Pending'">
                      {{ getStatusTamilLabel(m.admin_status) }}
                    </span>
                    <div *ngIf="m.admin_notes" class="notes-preview-snippet" [title]="m.admin_notes">
                      📝 {{ m.admin_notes }}
                    </div>
                  </td>
                  <td style="font-size:12px;color:#64748b;">{{ m.created_at | date:'dd MMM yyyy' }}</td>
                  <td>
                    <button class="btn-sm" style="background:#fffbeb;border-color:#fde68a;color:#b45309;font-weight:700;" (click)="viewMatchDetails(m)">
                      👁️ முழு விவரம் & குறிப்பு
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- MATCH & CONSULTATION DETAIL MODAL -->
          <div *ngIf="selectedMatch" class="modal-overlay" (click)="selectedMatch = null">
            <div class="modal-box" style="max-width:700px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <h3 style="margin:0;color:#0f172a;">
                    {{ selectedMatch.request_type === 'single_search' ? '🔍 வரன் தேடல் விவரங்கள்' : '💑 இருவர் ஜாதக பொருத்தம் விவரங்கள்' }}
                  </h3>
                  <span style="font-size:12px;color:#64748b;">கோரிக்கை ID: #{{ selectedMatch.id }} &bull; சமர்ப்பித்த தேதி: {{ selectedMatch.created_at | date:'dd MMMM yyyy' }}</span>
                </div>
                <button class="close-btn" (click)="selectedMatch = null">✕</button>
              </div>

              <!-- Requester Direct Contact Bar -->
              <div class="modal-contact-card" style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 16px;border-radius:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                  <span style="font-size:11px;color:#15803d;font-weight:700;text-transform:uppercase;display:block;">தொடர்பு கொள்ள வேண்டிய பயனர் விவரம்:</span>
                  <strong style="font-size:14px;color:#0f172a;">{{ selectedMatch.requester_display || selectedMatch.requester_name }}</strong>
                  <span *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" style="font-size:13px;color:#166534;margin-left:8px;font-weight:600;">
                    ({{ selectedMatch.contact_phone || selectedMatch.requester_phone }})
                  </span>
                </div>
                <div style="display:flex;gap:8px;">
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'tel:' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" class="btn-primary" style="padding:7px 14px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                    📞 தொலைபேசி அழைப்பு (Call)
                  </a>
                  <a *ngIf="selectedMatch.contact_phone || selectedMatch.requester_phone" [href]="'https://wa.me/91' + (selectedMatch.contact_phone || selectedMatch.requester_phone)" target="_blank" style="padding:7px 14px;font-size:12px;text-decoration:none;background:#25d366;color:#fff;font-weight:700;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              <!-- Pair Matching Side-by-Side Profiles -->
              <div *ngIf="selectedMatch.request_type !== 'single_search'" class="profiles-comparison-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
                <!-- Boy Profile Card -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;border-top:3px solid #3b82f6;">
                  <h4 style="margin:0 0 10px 0;color:#1d4ed8;font-size:14px;display:flex;align-items:center;gap:6px;">
                    <span>🤵</span> மணமகன் ஜாதகம் (Boy Profile)
                  </h4>
                  <div class="profile-meta-list" style="display:flex;flex-direction:column;gap:6px;font-size:12px;">
                    <div><span class="muted">பெயர்:</span> <strong>{{ selectedMatch.boy_name || '-' }}</strong></div>
                    <div><span class="muted">பிறந்த தேதி:</span> <strong>{{ selectedMatch.boy_dob | date:'dd MMM yyyy' }}</strong></div>
                    <div><span class="muted">பிறந்த நேரம்:</span> <strong>{{ selectedMatch.boy_tob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                    <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ selectedMatch.boy_pob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                    <div><span class="muted">ராசி:</span> <strong style="color:#b45309;">{{ selectedMatch.boy_rasi || '-' }}</strong></div>
                    <div><span class="muted">நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ selectedMatch.boy_nakshatra || '-' }}</strong></div>
                  </div>
                </div>

                <!-- Girl Profile Card -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;border-top:3px solid #ec4899;">
                  <h4 style="margin:0 0 10px 0;color:#be185d;font-size:14px;display:flex;align-items:center;gap:6px;">
                    <span>👰</span> மணமகள் ஜாதகம் (Girl Profile)
                  </h4>
                  <div class="profile-meta-list" style="display:flex;flex-direction:column;gap:6px;font-size:12px;">
                    <div><span class="muted">பெயர்:</span> <strong>{{ selectedMatch.girl_name || '-' }}</strong></div>
                    <div><span class="muted">பிறந்த தேதி:</span> <strong>{{ selectedMatch.girl_dob | date:'dd MMM yyyy' }}</strong></div>
                    <div><span class="muted">பிறந்த நேரம்:</span> <strong>{{ selectedMatch.girl_tob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                    <div><span class="muted">பிறந்த இடம்:</span> <strong>{{ selectedMatch.girl_pob || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                    <div><span class="muted">ராசி:</span> <strong style="color:#b45309;">{{ selectedMatch.girl_rasi || '-' }}</strong></div>
                    <div><span class="muted">நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ selectedMatch.girl_nakshatra || '-' }}</strong></div>
                  </div>
                </div>
              </div>

              <!-- Single Profile Search View -->
              <div *ngIf="selectedMatch.request_type === 'single_search'" style="background:#fdf4ff;border:1px solid #f0abfc;border-radius:12px;padding:16px;margin-bottom:18px;">
                <h4 style="margin:0 0 12px 0;color:#86198f;font-size:15px;">
                  {{ selectedMatch.candidate_gender === 'groom' ? '🤵 மணமகன் தேவைப்படும் வரன் பதிவு' : '👰 மணமகள் தேவைப்படும் வரன் பதிவு' }}
                </h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                  <div><span class="muted">ஜாதகர் பெயர்:</span> <strong>{{ selectedMatch.boy_name || selectedMatch.girl_name }}</strong></div>
                  <div><span class="muted">பிறந்த தேதி:</span> <strong>{{ (selectedMatch.boy_dob || selectedMatch.girl_dob) | date:'dd MMM yyyy' }}</strong></div>
                  <div><span class="muted">ராசி:</span> <strong style="color:#b45309;">{{ selectedMatch.boy_rasi || selectedMatch.girl_rasi || '-' }}</strong></div>
                  <div><span class="muted">நட்சத்திரம்:</span> <strong style="color:#b45309;">{{ selectedMatch.boy_nakshatra || selectedMatch.girl_nakshatra || '-' }}</strong></div>
                  <div><span class="muted">பிறந்த நேரம் & இடம்:</span> <strong>{{ selectedMatch.boy_tob || selectedMatch.girl_tob || '-' }} • {{ selectedMatch.boy_pob || selectedMatch.girl_pob || '-' }}</strong></div>
                  <div><span class="muted">கல்வி & வேலை:</span> <strong>{{ selectedMatch.education_job || 'குறிப்பிடப்படவில்லை' }}</strong></div>
                </div>
                <div *ngIf="selectedMatch.preferences" style="margin-top:12px;background:#fff;padding:10px;border-radius:8px;border:1px solid #f5d0fe;font-size:12px;">
                  <strong style="color:#86198f;display:block;margin-bottom:4px;">எதிர்பார்ப்புகள் & விருப்பங்கள் (Preferences):</strong>
                  <p style="margin:0;color:#334155;line-height:1.4;">{{ selectedMatch.preferences }}</p>
                </div>
              </div>

              <!-- Astrologer Consultation & Call Notes Form -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                <h4 style="margin:0 0 12px 0;color:#0f172a;font-size:14px;display:flex;align-items:center;gap:6px;">
                  <span>📝</span> ஜோதிடர் தொலைபேசி ஆலோசனைப் பதிவு (Astrologer Call Notes)
                </h4>
                
                <div class="form-group" style="margin-bottom:12px;">
                  <label>ஆலோசனை நிலை (Consultation Status):</label>
                  <select [(ngModel)]="selectedMatch.admin_status" class="ctrl">
                    <option value="Pending">⏳ Pending (புதிய கோரிக்கை - இன்னும் பேசவில்லை)</option>
                    <option value="Contacted">📞 Contacted (பயனரிடம் தொலைபேசியில் பேசப்பட்டது)</option>
                    <option value="Completed">✅ Consultation Done (முழுமையான ஆலோசனை & பலன் கூறப்பட்டது)</option>
                    <option value="Matches Suggested">🔍 Matches Suggested (வரன்கள் பரிந்துரைக்கப்பட்டது)</option>
                    <option value="Followup">📝 Follow-up Required (மீண்டும் அழைக்க வேண்டும்)</option>
                  </select>
                </div>

                <div class="form-group" style="margin-bottom:14px;">
                  <label>ஜோதிடர் குறிப்புகள் / பரிந்துரைகள் (Consultation Notes / Astrologer Remarks):</label>
                  <textarea 
                    [(ngModel)]="selectedMatch.admin_notes" 
                    class="ctrl" 
                    rows="3" 
                    placeholder="பயனரிடம் பேசிய விவரங்கள், ஜாதகப் பொருத்தம் பற்றிய தலைமை ஜோதிடரின் கருத்துக்கள், அல்லது பரிந்துரைக்கப்பட்ட வரன்கள் குறித்து இங்கு குறிப்பெடுக்கவும்..."
                  ></textarea>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span *ngIf="matchNotesSaveMsg" style="color:#059669;font-weight:600;font-size:12px;">{{ matchNotesSaveMsg }}</span>
                  <div style="display:flex;gap:10px;margin-left:auto;">
                    <button type="button" class="btn-cancel" (click)="selectedMatch = null">Close</button>
                    <button type="button" class="btn-primary" (click)="saveMatchConsultationNotes()">
                      💾 குறிப்புகளை சேமி (Save Consultation Notes)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- NEW MANUAL LEAD MODAL -->
          <div *ngIf="newLeadModalOpen" class="modal-overlay" (click)="newLeadModalOpen = false">
            <div class="modal-box" style="max-width:560px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3 style="margin:0;color:#0f172a;">+ புதிய வரன் / பொருத்தம் பதிவு</h3>
                <button class="close-btn" (click)="newLeadModalOpen = false">✕</button>
              </div>
              <form (ngSubmit)="submitManualLead()">
                <div class="form-group">
                  <label>கோரிக்கை வகை (Request Type):</label>
                  <select [(ngModel)]="newLeadForm.request_type" name="req_type" class="ctrl">
                    <option value="single_search">🔍 வரன் தேடல் (Looking for Bride / Groom)</option>
                    <option value="pair_match">💑 இருவர் ஜாதக பொருத்தம் (Pair Match)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>பயனர் தொடர்பு எண் (Contact Phone):</label>
                  <input [(ngModel)]="newLeadForm.contact_phone" name="c_phone" required class="ctrl" placeholder="எ.கா: 9876543210"/>
                </div>
                <div class="form-group">
                  <label>ஜாதகர் பெயர் (Candidate Name):</label>
                  <input [(ngModel)]="newLeadForm.candidate_name" name="c_name" required class="ctrl" placeholder="பெயர்"/>
                </div>
                <div class="form-group">
                  <label>தேவைப்படும் வரன் (Looking For):</label>
                  <select [(ngModel)]="newLeadForm.candidate_gender" name="c_gender" class="ctrl">
                    <option value="groom">மணமகன் தேவை (Seeking Groom)</option>
                    <option value="bride">மணமகள் தேவை (Seeking Bride)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>பிறந்த தேதி (DOB):</label>
                  <input type="date" [(ngModel)]="newLeadForm.candidate_dob" name="c_dob" required class="ctrl"/>
                </div>
                <div class="form-group">
                  <label>ராசி & நட்சத்திரம்:</label>
                  <div style="display:flex;gap:8px;">
                    <select [(ngModel)]="newLeadForm.candidate_rasi" name="c_rasi" class="ctrl">
                      <option *ngFor="let r of rasiEditorList" [value]="r.name">{{ r.name }}</option>
                    </select>
                    <input [(ngModel)]="newLeadForm.candidate_star" name="c_star" placeholder="நட்சத்திரம்" class="ctrl"/>
                  </div>
                </div>
                <div class="form-group">
                  <label>விருப்பங்கள் / எதிர்பார்ப்புகள் (Preferences):</label>
                  <textarea [(ngModel)]="newLeadForm.preferences" name="c_pref" class="ctrl" rows="2" placeholder="வயது வரம்பு, படிப்பு, தொழில், எதிர்பார்ப்புகள்..."></textarea>
                </div>
                <div class="modal-btns">
                  <button type="button" (click)="newLeadModalOpen = false" class="btn-cancel">Cancel</button>
                  <button type="submit" class="btn-primary">பதிவு செய் (Submit Lead)</button>
                </div>
              </form>
            </div>
          </div>

        </div>

        <!-- TAB 9: PAYMENT TRANSACTIONS LEDGER -->
        <div *ngIf="currentTab === 'payments'">
          <div class="header-banner">
            <div>
              <h1>💳 Payment Transaction Ledger</h1>
              <p>Full Razorpay payment history for all users — bookings, courses, and book purchases.</p>
            </div>
          </div>
          <div class="card-box">
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
                <tr *ngFor="let p of paymentTransactions">
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
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 10: NOTIFICATION BROADCAST -->
        <div *ngIf="currentTab === 'broadcast'">
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
                <div *ngIf="broadcastForm.target === 'specific'" class="form-group">
                  <label>User ID</label>
                  <input type="number" [(ngModel)]="broadcastForm.user_id" name="buid" class="ctrl" placeholder="e.g. 2"/>
                </div>
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
                <p *ngIf="broadcastMsg" class="success-msg">{{ broadcastMsg }}</p>
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
        </div>

      </main>

      <!-- MODAL: ADD ADMIN ACCOUNT -->
      <div *ngIf="openAddAdminModal" class="modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Create Admin / Astrologer Account</h3>
            <button class="close-btn" (click)="openAddAdminModal = false">✕</button>
          </div>

          <div *ngIf="addAdminError" style="margin-bottom: 14px; font-size: 12px; padding: 10px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; border-radius: 8px;">
            ⚠️ {{ addAdminError }}
          </div>

          <form (ngSubmit)="createAdmin()">
            <div class="form-group"><label>Full Name *</label><input type="text" [(ngModel)]="newAdmin.name" name="name" required placeholder="Full Name" class="ctrl"/></div>
            <div class="form-group"><label>Email Address *</label><input type="email" [(ngModel)]="newAdmin.email" name="email" required placeholder="admin@example.com" class="ctrl"/></div>
            <div class="form-group"><label>Password *</label><input type="password" [(ngModel)]="newAdmin.password" name="password" required placeholder="••••••••" class="ctrl"/></div>
            <div class="form-group"><label>Phone Number</label><input type="text" [(ngModel)]="newAdmin.phone" name="phone" placeholder="Phone Number" class="ctrl"/></div>

            <div class="modal-btns">
              <button type="button" class="btn-cancel" (click)="openAddAdminModal = false">Cancel</button>
              <button type="submit" [disabled]="createAdminLoading" class="btn-primary">
                <span *ngIf="!createAdminLoading">Create Account</span>
                <span *ngIf="createAdminLoading">Creating...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: CREATE COURSE -->
      <div *ngIf="openCourseModal" class="modal-overlay">
        <div class="modal-box">
          <h3>Create New Course</h3>
          <form (ngSubmit)="createCourse()">
            <div class="form-group"><label>Title</label><input [(ngModel)]="newCourse.title" name="title" required class="ctrl"/></div>
            <div class="form-group"><label>Description</label><textarea [(ngModel)]="newCourse.description" name="desc" class="ctrl"></textarea></div>
            <div class="form-group"><label>Price (₹)</label><input type="number" [(ngModel)]="newCourse.price" name="price" required class="ctrl"/></div>
            <div class="form-group"><label>Category</label><input [(ngModel)]="newCourse.category" name="cat" class="ctrl"/></div>
            <div class="form-group"><label>Level</label>
              <select [(ngModel)]="newCourse.level" name="lvl" class="ctrl">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div class="modal-btns">
              <button type="button" (click)="openCourseModal = false" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-primary">Publish Course</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: ADD MODULE -->
      <div *ngIf="openModuleModal" class="modal-overlay">
        <div class="modal-box">
          <h3>Add Syllabus Module</h3>
          <form (ngSubmit)="addModule()">
            <div class="form-group"><label>Module Title</label><input [(ngModel)]="newModuleTitle" name="modTitle" required class="ctrl"/></div>
            <div class="modal-btns">
              <button type="button" (click)="openModuleModal = false" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-primary">Add Module</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: ADD LESSON -->
      <div *ngIf="openLessonModal" class="modal-overlay">
        <div class="modal-box">
          <h3>Add Lesson Content</h3>
          <form (ngSubmit)="addLesson()">
            <div class="form-group"><label>Lesson Title</label><input [(ngModel)]="newLesson.title" name="ltitle" required class="ctrl"/></div>
            <div class="form-group"><label>Content Type</label>
              <select [(ngModel)]="newLesson.content_type" name="ltype" class="ctrl">
                <option value="video">🎥 Video (MP4 / HLS Stream)</option>
                <option value="audio">🎵 Audio MP3 Lesson</option>
                <option value="pdf">📄 PDF Document</option>
                <option value="live_link">🔴 Live Class Link (Google Meet / Zoom)</option>
              </select>
            </div>
            <div class="form-group"><label>Content URL / Live Link</label><input [(ngModel)]="newLesson.content_url" name="lurl" required class="ctrl"/></div>
            <div class="form-group"><label>Duration</label><input [(ngModel)]="newLesson.duration" name="ldur" placeholder="e.g. 20 mins" class="ctrl"/></div>
            <div class="modal-btns">
              <button type="button" (click)="openLessonModal = false" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-primary">Add Lesson</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: UPDATE COURIER -->
      <div *ngIf="selectedOrderForCourier" class="modal-overlay">
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

      <!-- MODAL: GRADE EXAM SUBMISSION -->
      <div *ngIf="selectedSubmissionForGrading" class="modal-overlay">
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

    /* LEFT SIDEBAR STYLING */
    .sidebar {
      width: 270px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      box-shadow: 2px 0 16px rgba(0, 0, 0, 0.03);
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
      border-bottom: 1px solid #f1f5f9;
    }

    .brand .icon { font-size: 26px; }
    .brand h2 { font-size: 20px; color: #b45309; margin: 0; font-weight: 700; }
    .brand-sub { font-size: 11px; color: #64748b; font-weight: 500; }

    .drawer-close-btn {
      display: none;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
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
      background: #fee2e2;
      color: #dc2626;
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
      color: #475569;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-menu button.active {
      background: #fffbeb;
      border-color: #fde68a;
      color: #b45309;
      font-weight: 700;
      box-shadow: 0 1px 4px rgba(180, 83, 9, 0.08);
    }

    @media (hover: hover) {
      .nav-menu button:hover:not(.active) {
        background: #f1f5f9;
        color: #0f172a;
      }
    }

    .nav-icon { font-size: 16px; }

    .user-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
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
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
    }

    .u-details { flex: 1; overflow: hidden; }
    .u-name { display: block; font-size: 13px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .u-role { font-size: 9px; color: #b45309; font-weight: 700; letter-spacing: 0.5px; }

    .btn-logout-full {
      width: 100%;
      padding: 9px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
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
      background: #fee2e2;
      border-color: #ef4444;
      color: #b91c1c;
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
  newCourse = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner' };

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
  selectedRasiDate = new Date().toISOString().split('T')[0];
  rasiEditorType = 'daily';
  rasiPublishing = false;
  rasiPredictionsLoading = false;
  rasiSaveSuccessMsg = '';

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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    const initialTab = this.route.snapshot?.queryParams?.['tab'];
    if (initialTab) {
      this.currentTab = initialTab;
    }
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
      }
    });

    this.currentUser = this.authService.getUser();
    setTimeout(() => {
      this.loadAllData();
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
    } catch (e) {}
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

  getStatusTamilLabel(status: string): string {
    switch (status) {
      case 'Contacted': return '📞 பேசப்பட்டது (Contacted)';
      case 'Completed':
      case 'Consultation Done': return '✅ பலன் கூறப்பட்டது (Completed)';
      case 'Matches Suggested': return '🔍 வரன் பரிந்துரைக்கப்பட்டது';
      case 'Followup': return '📝 Follow-up தேவை';
      default: return '⏳ புதிய கோரிக்கை (Pending)';
    }
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
}
