import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

        <!-- TAB 6: ASTROLOGY CONSULTATION APPOINTMENTS -->
        <div *ngIf="currentTab === 'services'">
          <div class="header-banner">
            <div>
              <h1>Astrology Consultation Appointment Bookings</h1>
              <p>View client appointment requests, Jathagam reading queries, consultation details, and fulfill orders.</p>
            </div>
          </div>

          <div class="card-box">
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
                <tr *ngFor="let b of serviceBookings">
                  <td><strong>{{ b.id }}</strong></td>
                  <td><strong>{{ b.user_name }}</strong></td>
                  <td>{{ b.user_phone }}</td>
                  <td><span class="badge-role">{{ b.service_type }}</span></td>
                  <td><strong>₹{{ b.price }}</strong></td>
                  <td>
                    <div *ngIf="b.details">
                      <small>📅 DOB: {{ b.details.dob || 'N/A' }} | ⏰ TOB: {{ b.details.tob || 'N/A' }}</small><br/>
                      <small>📍 POB: {{ b.details.pob || 'N/A' }}</small><br/>
                      <small class="muted">❓ Query: {{ b.details.query || 'N/A' }}</small>
                    </div>
                    <span *ngIf="!b.details" class="muted">No form details</span>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="b.status.toLowerCase()">
                      {{ b.status }}
                    </span>
                  </td>
                  <td>
                    <button 
                      *ngIf="b.status !== 'Completed'" 
                      class="btn-primary btn-sm"
                      (click)="fulfillBooking(b.id)"
                    >
                      ✓ Fulfill & Upload Chart
                    </button>
                    <a *ngIf="b.status === 'Completed' && b.chart_url" [href]="b.chart_url" target="_blank" class="pdf-link">
                      📄 View Chart
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 7: RASI PALAN EDITOR -->
        <div *ngIf="currentTab === 'rasi-editor'">
          <div class="header-banner flex-between">
            <div>
              <h1>🌟 Rasi Palan Editor</h1>
              <p>Update Daily / Weekly / Monthly / Yearly predictions for all 12 Rasis. Saved predictions are visible to all mobile users.</p>
            </div>
            <button class="btn-primary" (click)="publishRasiPalan()">📢 Publish All Predictions</button>
          </div>

          <!-- Tab Type Selector -->
          <div class="rasi-type-bar">
            <button *ngFor="let t of rasiTypes" [class.active]="rasiEditorType === t.val" (click)="rasiEditorType = t.val">{{ t.label }}</button>
          </div>

          <div class="rasi-editor-grid">
            <div *ngFor="let r of rasiEditorList; let i = index" class="rasi-editor-card">
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
          </div>
        </div>

        <!-- TAB 8: MARRIAGE MATCH LOG -->
        <div *ngIf="currentTab === 'matches'">
          <div class="header-banner">
            <div>
              <h1>💑 Marriage Match Requests Log</h1>
              <p>All Porutham matching requests submitted by users on the mobile app.</p>
            </div>
          </div>
          <div class="card-box">
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
                <tr *ngFor="let m of marriageMatches">
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
              </tbody>
            </table>
          </div>

          <!-- Match Detail Modal -->
          <div *ngIf="selectedMatch" class="modal-overlay">
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
                <div *ngFor="let d of selectedMatch.match_details" class="breakdown-row">
                  <span>{{ d.name }}</span>
                  <span [class.match-yes]="d.result === 'Match'" [class.match-no]="d.result !== 'Match'">
                    {{ d.result === 'Match' ? '✅' : '❌' }} {{ d.result }}
                  </span>
                </div>
              </div>
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

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
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
  currentTab = 'services';
  currentUser: User | null = null;
  mobileMenuOpen = false;

  selectTab(tab: string): void {
    this.currentTab = tab;
    this.mobileMenuOpen = false;
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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
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
}
