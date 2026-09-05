import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BackButtonService } from '../../services/back-button.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { ToastService } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IonContent, IonHeader, IonToolbar, IonSpinner } from '@ionic/angular/standalone';
<<<<<<< HEAD
=======

declare var html2pdf: any;
>>>>>>> 446cbe63af553bcf6b71e2e339919f0eccbf4568

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonSpinner, TranslatePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <div style="display: flex; align-items: center; padding: 0 8px;">
          <button type="button" (click)="goBack()" style="background: transparent; border: none; color: #ffd700; font-size: 22px; cursor: pointer; padding: 6px 10px; display: flex; align-items: center;">
            <i class="bi bi-arrow-left"></i>
          </button>
          <span class="brand" style="font-size: 18px; margin-left: 4px;"><i class="bi bi-person-fill me-1"></i> {{ 'profile.title' | translate }}</span>
          
          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px; padding-right: 8px;">
            <button type="button" (click)="toggleLang()" style="background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4); color: #ffd700; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="bi bi-translate"></i> {{ currentLang === 'ta' ? 'English' : 'தமிழ்' }}
            </button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">

      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="avatar-circle">{{ (userName && userName.charAt(0)) || 'U' }}</div>
        <div class="user-info">
          <h2>{{ userName }}</h2>
          <span class="user-email">{{ userEmail }}</span>
          @if (jathagam?.rasi) {
            <span class="rasi-tag">{{ jathagam.rasi }}</span>
          }
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        @for (t of tabs; track t.key) {
          <button [class.active]="activeTab === t.key" (click)="activeTab = t.key">
            <i [class]="t.icon" style="font-size: 16px;"></i>
            <span>{{ t.labelKey | translate }}</span>
          </button>
        }
      </div>

      <!-- TAB: PROFILE EDIT -->
      @if (activeTab === 'profile') {
        <div class="tab-content">
          <div class="section-title">
            <h3>{{ 'profile.editTitle' | translate }}</h3>
            <p>{{ 'profile.editSubtitle' | translate }}</p>
          </div>
          <div class="form-card">
            <div class="form-group"><label>{{ 'profile.name' | translate }}</label><input [(ngModel)]="editProfile.name" class="field" [placeholder]="'profile.name' | translate"/></div>
            <div class="form-group"><label>{{ 'profile.phone' | translate }}</label><input type="tel" [(ngModel)]="editProfile.phone" class="field" [placeholder]="'profile.phone' | translate"/></div>
            <div class="form-group"><label>{{ 'profile.address' | translate }}</label><textarea [(ngModel)]="editProfile.address" class="field textarea" [placeholder]="'profile.address' | translate" rows="2"></textarea></div>
            <button class="save-btn" (click)="saveProfile()" [disabled]="savingProfile">
              @if (savingProfile) {
                <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner>
              } @else {
                <span><i class="bi bi-floppy-fill me-1"></i> {{ 'profile.updateBtn' | translate }}</span>
              }
            </button>
            @if (profileMsg) {
              <p [class.success]="profileSuccess" class="msg">{{ profileMsg }}</p>
            }
          </div>

          <!-- Astrology Profile Card -->
          @if (jathagam) {
            <div class="astro-card">
              <h4><i class="bi bi-star-fill text-warning me-1"></i> {{ 'profile.astroTitle' | translate }}</h4>
              <div class="astro-grid">
                <div class="astro-item"><span class="al">{{ 'profile.rasi' | translate }}</span><span class="av gold">{{ jathagam.rasi }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.star' | translate }}</span><span class="av">{{ jathagam.nakshatra || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.lagnam' | translate }}</span><span class="av">{{ jathagam.lagnam || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.dob' | translate }}</span><span class="av">{{ jathagam.dob | date:'dd MMM yyyy' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.tob' | translate }}</span><span class="av">{{ jathagam.tob || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.pob' | translate }}</span><span class="av">{{ jathagam.pob || 'N/A' }}</span></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB: BOOKING HISTORY -->
      @if (activeTab === 'history') {
        <div class="tab-content">
          <div class="section-title"><h3><i class="bi bi-calendar-event me-1"></i> {{ 'profile.historyTitle' | translate }}</h3><p>{{ 'profile.historySubtitle' | translate }}</p></div>
          @if (loadingHistory) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (bookings.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-journal-text" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noHistory' | translate }}</p>
                </div>
              }
              @for (b of bookings; track b.id) {
                <div class="booking-card">
                  <div class="booking-header">
                    <span class="booking-id">{{ b.id }}</span>
                    <span class="status-pill" [class]="b.status.toLowerCase()">{{ b.status }}</span>
                  </div>
                  <h4>{{ b.service_type }}</h4>
                  <div class="booking-meta">
                    <span>₹{{ b.price }}</span>
                    <span>{{ b.created_at | date:'dd MMM yyyy' }}</span>
                  </div>
                  @if (b.details) {
                    <div>
                      <small class="muted">DOB: {{ b.details.dob || 'N/A' }} | POB: {{ b.details.pob || 'N/A' }}</small>
                    </div>
                  }
                  @if (b.chart_url && b.status === 'Completed') {
                    <a [href]="b.chart_url" target="_blank" class="chart-link"><i class="bi bi-file-earmark-pdf-fill me-1"></i> Chart PDF</a>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: PAYMENT HISTORY -->
      @if (activeTab === 'payments') {
        <div class="tab-content">
          <div class="section-title"><h3><i class="bi bi-credit-card me-1"></i> {{ 'profile.paymentsTitle' | translate }}</h3><p>{{ 'profile.paymentsSubtitle' | translate }}</p></div>
          @if (loadingPayments) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (payments.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-credit-card" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noPayments' | translate }}</p>
                </div>
              }
              @for (p of payments; track p.id) {
                <div class="payment-card">
                  <div class="payment-top">
                    <div>
                      <strong>{{ p.order_type | titlecase }}</strong>
                      <div class="muted">{{ p.description || 'Astrology Service' }}</div>
                    </div>
                    <div class="payment-right">
                      <span class="amount">₹{{ p.amount }}</span>
                      <span class="pay-status" [class]="p.status.toLowerCase()">{{ p.status }}</span>
                    </div>
                  </div>
                  <div class="payment-footer">
                    <small class="muted">{{ p.created_at | date:'dd MMM yyyy, hh:mm a' }}</small>
                    @if (p.razorpay_payment_id) {
                      <small class="muted">ID: {{ p.razorpay_payment_id }}</small>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: NOTIFICATIONS -->
      @if (activeTab === 'notifications') {
        <div class="tab-content">
          <div class="section-title-row">
            <h3><i class="bi bi-bell-fill me-1"></i> {{ 'profile.notifsTitle' | translate }}</h3>
            @if (unreadCount > 0) {
              <button class="mark-all-btn" (click)="markAllRead()">{{ 'profile.markAllRead' | translate }}</button>
            }
          </div>
          @if (loadingNotifs) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (notifications.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-bell" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noNotifs' | translate }}</p>
                </div>
              }
              @for (n of notifications; track n.id) {
                <div class="notif-card" [class.unread]="!n.is_read" (click)="markRead(n)">
                  <div class="notif-icon"><i [class]="getNotifIconClass(n.type)"></i></div>
                  <div class="notif-body">
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.body }}</p>
                    <small class="muted">{{ n.created_at | date:'dd MMM, hh:mm a' }}</small>
                  </div>
                  @if (!n.is_read) {
                    <div class="unread-dot"></div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: EXAM RESULTS -->
      @if (activeTab === 'results') {
        <div class="tab-content">
          <div class="section-title">
            <h3><i class="bi bi-journal-check me-1 text-warning"></i> {{ currentLang === 'ta' ? 'தேர்வு முடிவுகள்' : 'Exam Results & Marksheets' }}</h3>
            <p>{{ currentLang === 'ta' ? 'உங்கள் ஆன்லைன் மற்றும் ஜாதகக் கட்ட நடைமுறைத் தேர்வு மதிப்பெண்கள்' : 'Your MCQ and Practical Jadhagam Exam Breakdown & Certificates' }}</p>
          </div>

          @if (loadingResults) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (results.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-journal-x" style="font-size: 36px; color: #8a8ab0;"></i>
                  <p>{{ currentLang === 'ta' ? 'தேர்வு முடிவுகள் எதுவும் வெளியிடப்படவில்லை.' : 'No published exam results found yet.' }}</p>
                </div>
              }
              @for (r of results; track r.id) {
                <div class="result-card" style="background: linear-gradient(135deg, #160f33, #1e1342); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 16px; margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                      <h4 style="color: #fff; margin: 0 0 4px 0; font-size: 15px; font-weight: 700;">{{ r.course_title }}</h4>
                      <span style="font-size: 11px; color: #ffd700; font-weight: 600;">{{ r.batch_name || (currentLang === 'en' ? 'General Batch' : 'பொது பேட்ச்') }}</span>
                    </div>
                    <span [style.background]="(r.status === 'Approved' || r.score >= 40) ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'"
                          [style.color]="(r.status === 'Approved' || r.score >= 40) ? '#4ade80' : '#f87171'"
                          style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">
                      {{ (r.status === 'Approved' || r.score >= 40) ? (currentLang === 'ta' ? 'தேர்ச்சி' : 'PASS') : (currentLang === 'ta' ? 'மறுதேர்வு' : 'FAIL') }}
                    </span>
                  </div>

                  <!-- Scores Breakdown Grid -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; margin-bottom: 12px; text-align: center;">
                    <div>
                      <span style="display: block; font-size: 10px; color: #8a8ab0;">MCQ Score</span>
                      <strong style="color: #60a5fa; font-size: 14px;">{{ r.mcq_score !== null ? r.mcq_score : '-' }}</strong>
                    </div>
                    <div>
                      <span style="display: block; font-size: 10px; color: #8a8ab0;">Practical</span>
                      <strong style="color: #c084fc; font-size: 14px;">{{ r.practical_score !== null ? r.practical_score : '-' }}</strong>
                    </div>
                    <div>
                      <span style="display: block; font-size: 10px; color: #8a8ab0;">Total Marks</span>
                      <strong style="color: #ffd700; font-size: 15px;">{{ r.score !== null ? r.score : (r.total_score || '-') }} / 100</strong>
                    </div>
                  </div>

                  <!-- PDF Download Links -->
                  <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;">
                    @if (r.marksheet_download_url) {
                      <a [href]="r.marksheet_download_url" target="_blank" style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                        <i class="bi bi-file-earmark-spreadsheet-fill"></i> {{ currentLang === 'ta' ? 'மதிப்பெண் தாள்' : 'Marksheet' }}
                      </a>
                    }
                    @if (r.cert_pdf_url || r.certificate_number) {
                      <a [href]="r.cert_pdf_url || ('/api/certificates/' + r.certificate_number + '/download')" target="_blank" style="background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); color: #ffd700; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                        <i class="bi bi-trophy-fill"></i> {{ currentLang === 'ta' ? 'சான்றிதழ்' : 'Certificate' }}
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      
      <!-- TAB: MARRIAGE -->
      @if (activeTab === 'marriage') {
        <div class="tab-content">
          <div class="section-title">
            <h3><i class="bi bi-suit-heart-fill me-1 text-rose"></i> {{ 'matching.matchRecords' | translate }}</h3>
          </div>
          @if (loadingMatches) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            @if (myMatches.length === 0 && myProfiles.length === 0) {
              <div class="empty-state">
                <i class="bi bi-suit-heart-fill" style="font-size: 36px; color: #8a8ab0;"></i>
                <p>{{ currentLang === 'ta' ? 'பதிவுகள் எதுவும் இல்லை.' : 'No records found.' }}</p>
              </div>
            }
            
            @if (myMatches.length > 0) {
              <div style="display:flex; flex-direction:column; gap:12px; margin-bottom: 24px;">
                @for (m of myMatches; track m.id) {
                  <div class="result-card" style="background: linear-gradient(135deg, #160f33, #1e1342); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <strong style="color:#fff; font-size:13px;">
                        <i class="bi bi-suit-heart-fill" style="color:#e11d48; margin-right:4px;"></i> {{ 'matching.porutham10Title' | translate }}
                      </strong>
                      <span style="font-size:10px; font-weight:700; background:rgba(212,175,55,0.2); color:#ffd700; padding:2px 6px; border-radius:4px;">{{ m.admin_status || m.consultation_status || 'Pending' }}</span>
                    </div>

                    <div style="font-size:12px; color:#cbd5e1; display:flex; align-items:center; gap:8px; margin-top: 8px;">
                      <span>👦 {{ m.boy_name }}</span>
                      <i class="bi bi-arrow-left-right text-muted" style="font-size:10px;"></i>
                      <span>👧 {{ m.girl_name }}</span>
                    </div>

                    <div style="font-size:11px; color:#8a8ab0; display:flex; justify-content:space-between; margin-top:12px; align-items: center;">
                      <span>{{ m.created_at | date:'dd MMM yyyy' }}</span>
                      @if (m.result_document) {
                        <a [href]="m.result_document" target="_blank" style="color:#10b981; text-decoration:none; font-weight:600; display:flex; align-items:center; gap:4px; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:6px;">
                          <i class="bi bi-file-earmark-arrow-down-fill"></i> Download PDF
                        </a>
                      }
                    </div>

                    @if (m.report_data) {
                      <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                        <div style="font-size:11px; color:#8a8ab0; margin-bottom:4px;">{{ currentLang === 'ta' ? 'திருமணப் பொருத்த அறிக்கை:' : 'Marriage Match Report:' }}</div>
                        @if (m.report_data.astrologer_title) {
                          <div style="font-size:12px; color:#ffd700; margin-bottom:2px;">{{ m.report_data.astrologer_title }}</div>
                        }
                        @if (m.report_data.astrologer_opinion) {
                          <div style="font-size:12px; color:#cbd5e1; margin-top:6px; font-style:italic;">"{{ m.report_data.astrologer_opinion }}"</div>
                        }
                        <button (click)="openReportModal(m)" style="margin-top: 10px; width: 100%; background: linear-gradient(135deg, #d4af37, #aa7c11); color: #000; border: none; padding: 8px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;">
                          <i class="bi bi-eye-fill"></i> {{ currentLang === 'en' ? 'View Full Report' : 'முழு அறிக்கையைக் காண்க' }}
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (myProfiles.length > 0) {
              <div style="display:flex; flex-direction:column; gap:12px;">
                <h4 style="color:#fff; font-size:14px; margin:0 0 8px 0;"><i class="bi bi-file-earmark-person-fill text-gold me-1"></i> {{ 'matching.regRecords' | translate }}</h4>
                @for (p of myProfiles; track p.id) {
                  <div class="result-card" style="background: linear-gradient(135deg, #160f33, #1e1342); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <strong style="color:#fff; font-size:13px;">
                        <i class="bi bi-file-earmark-person-fill" style="color:#d97706; margin-right:4px;"></i> {{ 'matching.varanRegBadge' | translate }}
                      </strong>
                      <span style="font-size:10px; font-weight:700; background:rgba(212,175,55,0.2); color:#ffd700; padding:2px 6px; border-radius:4px;">{{ p.status || 'Pending' }}</span>
                    </div>

                    <div style="font-size:12px; color:#cbd5e1; display:flex; flex-direction:column; gap:4px; margin-top:8px;">
                      <span style="font-weight:600; color:#fff;">{{ p.name }} <small style="color:#8a8ab0;">({{ p.gender === 'male' ? 'ஆண்' : 'பெண்' }})</small></span>
                      <span><i class="bi bi-telephone-fill me-1" style="font-size:10px;"></i> {{ p.phone_number }}</span>
                      @if(p.rasi || p.nakshatra) {
                        <span><i class="bi bi-stars me-1" style="font-size:10px;"></i> {{ p.rasi }} - {{ p.nakshatra }}</span>
                      }
                    </div>

                    <div style="font-size:11px; color:#8a8ab0; display:flex; justify-content:space-between; margin-top:12px; align-items: center;">
                      <span>{{ p.created_at | date:'dd MMM yyyy' }}</span>
                      @if (p.result_document) {
                        <a [href]="p.result_document" target="_blank" style="color:#10b981; text-decoration:none; font-weight:600; display:flex; align-items:center; gap:4px; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:6px;">
                          <i class="bi bi-file-earmark-arrow-down-fill"></i> Download PDF
                        </a>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      }
<!-- TAB: NOTIFICATION PREFERENCES & LANGUAGE SETTING -->
      @if (activeTab === 'preferences') {
        <div class="tab-content">
          <div class="section-title">
            <h3><i class="bi bi-gear-fill me-1"></i> {{ 'profile.settingsTitle' | translate }}</h3>
            <p>{{ 'profile.settingsSubtitle' | translate }}</p>
          </div>

          <!-- App Language Selector Card -->
          <div class="pref-card" style="margin-bottom: 16px;">
            <div class="pref-row">
              <div class="pref-info">
                <span class="pref-icon"><i class="bi bi-translate text-warning" style="font-size: 22px;"></i></span>
                <div>
                  <strong>{{ 'profile.languageSetting' | translate }}</strong>
                  <p class="muted">Select Language / மொழியைத் தேர்வு செய்க</p>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" 
                  (click)="setLang('ta')" 
                  [style.background]="currentLang === 'ta' ? 'linear-gradient(135deg, #ffd700, #aa7c11)' : 'rgba(255,255,255,0.1)'"
                  [style.color]="currentLang === 'ta' ? '#000' : '#fff'"
                  style="border: none; padding: 7px 14px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                  தமிழ்
                </button>
                <button type="button" 
                  (click)="setLang('en')" 
                  [style.background]="currentLang === 'en' ? 'linear-gradient(135deg, #ffd700, #aa7c11)' : 'rgba(255,255,255,0.1)'"
                  [style.color]="currentLang === 'en' ? '#000' : '#fff'"
                  style="border: none; padding: 7px 14px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                  English
                </button>
              </div>
            </div>
          </div>

          <!-- Notification Preference -->
          <div class="pref-card">
            <div class="pref-row">
              <div class="pref-info">
                <span class="pref-icon"><i class="bi bi-star-fill text-warning" style="font-size: 20px;"></i></span>
                <div>
                  <strong>{{ 'profile.dailyNotif' | translate }}</strong>
                  <p class="muted">{{ 'profile.dailyNotifDesc' | translate }}</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [checked]="dailyNotifPref" (change)="toggleDailyNotif()">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          @if (prefMsg) {
            <p [class.success]="prefSuccess" class="msg">{{ prefMsg }}</p>
          }
        </div>
      }

      <!-- FULL REPORT MODAL OVERLAY -->
      @if (selectedReportMatch) {
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>திருமணப் பொருத்த அறிக்கை</h3>
              <button class="close-btn" (click)="closeReportModal()"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body" id="report-pdf-content">
              <!-- Report Header -->
              <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">
                <h2 style="color: #d4af37; margin: 0; font-size: 20px; font-weight: 800;">{{ selectedReportMatch.report_data.astrologer_title || 'ஜோதிடாலயம்' }}</h2>
                <p style="color: #000; margin: 5px 0; font-weight: bold; font-size: 14px;">{{ selectedReportMatch.report_data.astrologer_name }}</p>
                <p style="color: #333; margin: 0; font-size: 12px;">{{ selectedReportMatch.report_data.astrologer_address }}</p>
                <p style="color: #333; margin: 5px 0 0; font-size: 12px;">Contact: {{ selectedReportMatch.report_data.astrologer_phone }}</p>
              </div>

              <!-- Couple Details -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #fdfbf7; border: 1px solid #e2d3a3; padding: 10px; border-radius: 8px;">
                <div style="width: 48%; color: #000;">
                  <h4 style="color: #aa7c11; margin: 0 0 10px; border-bottom: 1px dashed #aa7c11; padding-bottom: 5px;">ஆண் விவரம்</h4>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>பெயர்:</strong> {{ selectedReportMatch.report_data.boy_name }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>ராசி:</strong> {{ selectedReportMatch.report_data.boy_rasi }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>நட்சத்திரம்:</strong> {{ selectedReportMatch.report_data.boy_star }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>வயது:</strong> {{ selectedReportMatch.report_data.boy_age }}</p>
                </div>
                <div style="width: 48%; color: #000;">
                  <h4 style="color: #aa7c11; margin: 0 0 10px; border-bottom: 1px dashed #aa7c11; padding-bottom: 5px;">பெண் விவரம்</h4>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>பெயர்:</strong> {{ selectedReportMatch.report_data.girl_name }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>ராசி:</strong> {{ selectedReportMatch.report_data.girl_rasi }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>நட்சத்திரம்:</strong> {{ selectedReportMatch.report_data.girl_star }}</p>
                  <p style="margin: 3px 0; font-size: 12px;"><strong>வயது:</strong> {{ selectedReportMatch.report_data.girl_age }}</p>
                </div>
              </div>

              <!-- 11 Poruthangal Table -->
              <h4 style="color: #000; margin-bottom: 10px;">{{ currentLang === 'en' ? '11 Poruthams' : '11 பொருத்தங்கள்' }}</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; color: #000; font-size: 12px;">
                <thead>
                  <tr style="background: #f0e6d2;">
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">{{ currentLang === 'en' ? 'Porutham' : 'பொருத்தம்' }}</th>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">{{ currentLang === 'en' ? 'Status' : 'நிலை' }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of selectedReportMatch.report_data.poruthangal; track p.name) {
                    <tr>
                      <td style="border: 1px solid #ccc; padding: 6px;">{{ p.name }}</td>
                      <td style="border: 1px solid #ccc; padding: 6px; text-align: center; font-weight: bold;" [style.color]="p.status === 'உண்டு' ? 'green' : (p.status === 'இல்லை' ? 'red' : '#000')">{{ p.status || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Summary -->
              <div style="background: #f9f9f9; border: 1px solid #ddd; padding: 10px; border-radius: 8px; color: #000;">
                <p style="margin: 5px 0; font-size: 13px;"><strong>மொத்த பொருத்தம்:</strong> <span style="color: #d4af37; font-size: 16px;">{{ selectedReportMatch.report_data.total_porutham }}</span></p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>முக்கிய பொருத்தம்:</strong> {{ selectedReportMatch.report_data.important_porutham }}</p>
                <p style="margin: 10px 0 5px; font-size: 13px;"><strong>ஜோதிடர் குறிப்பு:</strong></p>
                <p style="margin: 0; font-style: italic; color: #444; font-size: 13px;">"{{ selectedReportMatch.report_data.astrologer_opinion }}"</p>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="download-btn" (click)="downloadPdf()" [disabled]="isDownloadingPdf">
                @if (isDownloadingPdf) {
                  <ion-spinner name="dots" style="width: 24px; color: #000;"></ion-spinner>
                } @else {
                  <i class="bi bi-file-earmark-pdf-fill"></i> Download PDF / Image
                }
              </button>
            </div>
          </div>
        </div>
      }

    </ion-content>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    ion-toolbar { --background: #0d0822; }
    .brand { color: #ffd700; font-weight: 700; font-size: 17px; }
    .profile-content { --background: #090614; }

    .profile-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 16px;
      background: linear-gradient(135deg, #1a0f35, #0d0822);
      border-bottom: 1px solid rgba(212,175,55,0.2);
    }

    .avatar-circle {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #aa7c11);
      color: #000; font-weight: 800; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .user-info h2 { margin: 0 0 2px; color: #fff; font-size: 18px; }
    .user-email { font-size: 11px; color: #8a8ab0; display: block; margin-bottom: 6px; }
    .rasi-tag { background: rgba(212,175,55,0.2); color: #ffd700; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }

    .tab-bar {
      display: flex;
      background: #120b29;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tab-bar button {
      flex: 1;
      padding: 10px 6px 8px;
      background: transparent;
      border: none;
      color: #8a8ab0;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      border-bottom: 2px solid transparent;
      min-width: 70px;
      transition: all 0.2s;
    }

    .tab-bar button span:first-child { font-size: 18px; }
    .tab-bar button.active { color: #ffd700; border-bottom-color: #ffd700; }

    .tab-content { padding: 14px 14px 80px; }

    .section-title { margin-bottom: 14px; }
    .section-title h3 { color: #fff; font-size: 16px; margin: 0 0 3px; }
    .section-title p { color: #8a8ab0; font-size: 12px; margin: 0; }

    .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-title-row h3 { color: #fff; font-size: 16px; margin: 0; }
    .mark-all-btn { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); color: #ffd700; padding: 4px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; }

    .form-card { background: #160f33; border-radius: 14px; padding: 14px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 14px; }
    .form-group { margin-bottom: 10px; }
    label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 3px; }
    .field { width: 100%; box-sizing: border-box; padding: 9px 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }
    .textarea { resize: none; font-family: inherit; }
    .save-btn { padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 8px; color: #000; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .msg { font-size: 12px; margin-top: 8px; }
    .msg.success { color: #4ade80; }

    .astro-card { background: linear-gradient(135deg, #1a0f35, #160b2c); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 14px; }
    .astro-card h4 { color: #ffd700; font-size: 14px; margin: 0 0 12px; }
    .astro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .astro-item { background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 8px; }
    .al { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 2px; }
    .av { font-size: 13px; color: #fff; font-weight: 600; }
    .av.gold { color: #ffd700; }

    .booking-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; margin-bottom: 10px; }
    .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .booking-id { font-size: 11px; color: #8a8ab0; font-family: monospace; }
    .status-pill { padding: 3px 9px; border-radius: 12px; font-size: 10px; font-weight: 700; }
    .status-pill.pending { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .status-pill.completed { background: rgba(34,197,94,0.2); color: #4ade80; }
    .booking-card h4 { color: #fff; font-size: 14px; margin: 0 0 6px; }
    .booking-meta { display: flex; gap: 12px; font-size: 12px; color: #8a8ab0; margin-bottom: 4px; }
    .muted { color: #8a8ab0; font-size: 11px; }
    .chart-link { color: #60a5fa; font-size: 12px; text-decoration: none; display: block; margin-top: 8px; font-weight: 600; }

    .payment-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
    .payment-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .payment-right { text-align: right; }
    .amount { display: block; font-size: 16px; font-weight: 700; color: #ffd700; }
    .pay-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; }
    .pay-status.paid { background: rgba(34,197,94,0.2); color: #4ade80; }
    .pay-status.pending { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .payment-footer { display: flex; justify-content: space-between; }

    .notif-card { display: flex; gap: 12px; background: #160f33; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-bottom: 8px; cursor: pointer; position: relative; transition: background 0.2s; }
    .notif-card.unread { background: #1a0f35; border-color: rgba(212,175,55,0.25); }
    .notif-icon { font-size: 22px; flex-shrink: 0; }
    .notif-body strong { color: #fff; font-size: 13px; }
    .notif-body p { color: #a0a0c0; font-size: 12px; margin: 3px 0; line-height: 1.4; }
    .unread-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: #ffd700; }

    .empty-state { text-align: center; padding: 50px 20px; }
    .empty-state span { font-size: 40px; }
    .empty-state p { color: #8a8ab0; font-size: 14px; margin-top: 10px; }

    .pref-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; margin-bottom: 14px; }
    .pref-row { display: flex; align-items: center; justify-content: space-between; }
    .pref-info { display: flex; align-items: center; gap: 12px; flex: 1; }
    .pref-icon { font-size: 24px; flex-shrink: 0; }
    .pref-info strong { color: #fff; font-size: 14px; display: block; margin-bottom: 2px; }
    .pref-info .muted { font-size: 11px; line-height: 1.4; }

    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; inset: 0; background: rgba(255,255,255,0.15); border-radius: 26px; cursor: pointer; transition: 0.3s; }
    .toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
    .toggle-switch input:checked + .toggle-slider { background: linear-gradient(135deg, #d4af37, #aa7c11); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(22px); }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
    .modal-content { background: #fff; width: 100%; max-width: 500px; max-height: 90vh; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .modal-header { padding: 15px 20px; background: #fdfbf7; border-bottom: 1px solid #e2d3a3; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; color: #aa7c11; font-size: 16px; font-weight: bold; }
    .close-btn { background: transparent; border: none; font-size: 20px; color: #333; cursor: pointer; }
    .modal-body { padding: 20px; overflow-y: auto; background: #fff; }
    .modal-footer { padding: 15px 20px; background: #fdfbf7; border-top: 1px solid #e2d3a3; }
    .download-btn { width: 100%; background: linear-gradient(135deg, #d4af37, #aa7c11); color: #000; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
  `]
})
export class ProfilePage implements OnInit {
  tabs = [
    { key: 'profile', icon: 'bi bi-person-fill', labelKey: 'profile.tabProfile' },
    { key: 'results', icon: 'bi bi-journal-check', labelKey: 'profile.tabResults' },
    { key: 'history', icon: 'bi bi-clock-history', labelKey: 'profile.tabHistory' },
    { key: 'payments', icon: 'bi bi-credit-card-fill', labelKey: 'profile.tabPayments' },
    { key: 'notifications', icon: 'bi bi-bell-fill', labelKey: 'profile.tabNotifs' },
    { key: 'preferences', icon: 'bi bi-gear-fill', labelKey: 'profile.tabSettings' },
    { key: 'marriage', icon: 'bi bi-suit-heart-fill', labelKey: 'matching.matchRecords' },
  ];
  activeTab = 'profile';

  userName = '';
  userEmail = '';
  jathagam: any = null;

  editProfile = { name: '', phone: '', address: '' };
  savingProfile = false;
  profileMsg = '';
  profileSuccess = false;

  results: any[] = [];
  loadingResults = false;

  bookings: any[] = [];
  loadingHistory = false;

  payments: any[] = [];
  loadingPayments = false;

  notifications: any[] = [];
  loadingNotifs = false;

  myMatches: any[] = [];
  myProfiles: any[] = [];
  loadingMatches = false;
  unreadCount = 0;

  dailyNotifPref = true;
  prefMsg = '';
  prefSuccess = false;

  selectedReportMatch: any = null;
  isDownloadingPdf = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    public translationService: TranslationService,
    private toastService: ToastService
  ) { }

  get currentLang(): LanguageCode {
    return this.translationService.currentLanguage();
  }

  setLang(lang: LanguageCode) {
    this.translationService.setLanguage(lang);
  }

  toggleLang() {
    this.translationService.toggleLanguage();
  }

  ionViewDidEnter() {
    this.backButtonService.registerHandler(this.customBackHandler);
  }

  ionViewWillLeave() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  ngOnDestroy() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  customBackHandler = () => {
    this.goBack();
    return true;
  };

  goBack() {
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    this.loadProfile();
    this.loadExamResults();
    this.loadHistory();
    this.loadPayments();
    this.loadNotifications();
    this.loadPreferences();
    this.loadMyMatches();
    this.loadMyProfiles();
  }

  loadExamResults() {
    this.loadingResults = true;
    this.http.get<any>(`${environment.apiUrl}/user/certificates`, this.headers).subscribe({
      next: (res: any) => {
        this.results = res?.results || [];
        this.loadingResults = false;
      },
      error: () => {
        this.loadingResults = false;
      }
    });
  }

  get token(): string { return this.authService.getToken() || ''; }
  get headers(): any { return this.authService.getAuthHeaders(); }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/user/profile`, this.headers).subscribe({
      next: (res: any) => {
        if (res) {
          this.editProfile = { name: res.name || '', phone: res.phone || '', address: res.address || '' };
          this.jathagam = res.jathagam_details;
          this.userName = res.name || '';
        }
      },
      error: () => { }
    });
  }

  saveProfile() {
    this.savingProfile = true;
    this.profileMsg = '';
    this.http.put<any>(`${environment.apiUrl}/user/profile`, this.editProfile, this.headers).subscribe({
      next: (res: any) => {
        this.profileMsg = this.translationService.translate('common.success', 'சுயவிவரம் புதுப்பிக்கப்பட்டது!');
        this.profileSuccess = true;
        this.savingProfile = false;
      },
      error: () => { this.profileMsg = this.translationService.translate('common.error', 'பிழை ஏற்பட்டது.'); this.profileSuccess = false; this.savingProfile = false; }
    });
  }

  loadMyMatches() {
    this.loadingMatches = true;
    this.http.get<any>(`${environment.apiUrl}/jathagam/my-matches`, this.headers).subscribe({
      next: (res: any) => { this.myMatches = res?.matches || []; this.loadingMatches = false; },
      error: () => { this.loadingMatches = false; }
    });
  }

  loadMyProfiles() {
    this.http.get<any>(`${environment.apiUrl}/user/matrimony-profiles`, this.headers).subscribe({
      next: (res: any) => { this.myProfiles = res?.profiles || []; },
      error: () => { }
    });
  }

  loadHistory() {
    this.loadingHistory = true;
    this.http.get<any>(`${environment.apiUrl}/user/bookings`, this.headers).subscribe({
      next: (res: any) => { this.bookings = res?.bookings || []; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  loadPayments() {
    this.loadingPayments = true;
    this.http.get<any>(`${environment.apiUrl}/user/payments`, this.headers).subscribe({
      next: (res: any) => { this.payments = res?.payments || []; this.loadingPayments = false; },
      error: () => { this.loadingPayments = false; }
    });
  }

  loadNotifications() {
    this.loadingNotifs = true;
    this.http.get<any>(`${environment.apiUrl}/user/notifications`, this.headers).subscribe({
      next: (res: any) => {
        this.notifications = res?.notifications || [];
        this.unreadCount = res?.unread_count || 0;
        this.loadingNotifs = false;
      },
      error: () => { this.loadingNotifs = false; }
    });
  }

  markRead(n: any) {
    if (n.is_read) return;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, this.headers).subscribe({
      next: (res: any) => { n.is_read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); },
      error: () => { }
    });
  }

  markAllRead() {
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, this.headers).subscribe({
      next: (res: any) => { this.notifications.forEach(n => n.is_read = true); this.unreadCount = 0; },
      error: () => { }
    });
  }

  getNotifIconClass(type: string): string {
    const icons: Record<string, string> = {
      booking_confirmed: 'bi bi-check-circle-fill text-success',
      booking_fulfilled: 'bi bi-check-all text-success',
      rasi_palan: 'bi bi-star-fill text-warning',
      certificate: 'bi bi-trophy-fill text-warning',
      course: 'bi bi-journal-bookmark-fill text-primary',
      general: 'bi bi-bell-fill text-info'
    };
    return icons[type] || 'bi bi-bell-fill text-info';
  }

  loadPreferences() {
    this.http.get<any>(`${environment.apiUrl}/user/notification-preferences`, this.headers).subscribe({
      next: (res: any) => { this.dailyNotifPref = res?.daily_rasi_notification ?? true; },
      error: () => { }
    });
  }

  toggleDailyNotif() {
    this.prefMsg = '';
    const newValue = !this.dailyNotifPref;
    this.http.put<any>(`${environment.apiUrl}/user/notification-preferences`, { daily_rasi_notification: newValue }, this.headers).subscribe({
      next: (res: any) => {
        this.dailyNotifPref = res?.daily_rasi_notification;
        this.prefMsg = res?.message || 'விருப்பம் புதுப்பிக்கப்பட்டது.';
        this.prefSuccess = true;
      },
      error: () => {
        this.prefMsg = 'பிழை ஏற்பட்டது.';
        this.prefSuccess = false;
      }
    });
  }

  openReportModal(match: any) {
    this.selectedReportMatch = match;
  }

  closeReportModal() {
    this.selectedReportMatch = null;
  }

  async downloadPdf() {
    this.isDownloadingPdf = true;
    const element = document.getElementById('report-pdf-content');
    if (!element) {
      this.isDownloadingPdf = false;
      return;
    }
    
    // Create a clone for perfect A4 rendering without mobile layout constraints
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '800px';
    clone.style.maxWidth = 'none';
    clone.style.padding = '40px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.overflow = 'visible';
    clone.style.background = '#ffffff';
    clone.style.boxSizing = 'border-box';
    document.body.appendChild(clone);

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `marriage_report_${this.selectedReportMatch.report_data.boy_name}_${this.selectedReportMatch.report_data.girl_name}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0, windowWidth: 800, width: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    let html2pdfObj = (window as any).html2pdf;
    if (!html2pdfObj) {
      try {
        const mod: any = await import(/* webpackIgnore: true */ 'html2pdf.js' as any);
        html2pdfObj = mod?.default || mod;
      } catch (e) {
        console.error('Failed to load html2pdf.js', e);
      }
    }

    if (html2pdfObj) {
      html2pdfObj().from(clone).set(opt).save().then(() => {
        this.isDownloadingPdf = false;
        if (document.body.contains(clone)) document.body.removeChild(clone);
      }).catch((err: any) => {
        console.error('PDF Generation Error:', err);
        this.isDownloadingPdf = false;
        if (document.body.contains(clone)) document.body.removeChild(clone);
        alert('Error generating PDF.');
      });
    } else {
      this.isDownloadingPdf = false;
<<<<<<< HEAD
      if (document.body.contains(clone)) document.body.removeChild(clone);
      alert('Error loading PDF generator.');
    }
=======
      this.toastService.success('PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது!');
      document.body.removeChild(clone);
    }).catch((err: any) => {
      console.error('PDF Generation Error:', err);
      this.isDownloadingPdf = false;
      document.body.removeChild(clone);
      this.toastService.error('Error generating PDF.');
    });
>>>>>>> 446cbe63af553bcf6b71e2e339919f0eccbf4568
  }
}
