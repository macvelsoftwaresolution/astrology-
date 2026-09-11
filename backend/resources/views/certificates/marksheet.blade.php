<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $title }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #e2e8f0;
      font-family: "Noto Serif Tamil", "Outfit", "Segoe UI", serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 10px;
      color: #000;
    }
    .no-print-toolbar {
      margin: 0 auto 20px auto;
      background: #1e293b;
      color: #fff;
      padding: 10px 22px;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      display: flex;
      gap: 14px;
      align-items: center;
      width: fit-content;
    }
    .btn-action {
      background: #d97706;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover { background: #b45309; }
    .btn-close {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #475569;
      padding: 8px 14px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-close:hover { color: #fff; border-color: #fff; }

    .a4-page-sheet {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      box-sizing: border-box;
      padding: 8mm;
      color: #000;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .official-marksheet-layout {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .marksheet-outer-border {
      border: 8px solid #b45309;
      padding: 4px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #ffffff;
    }
    .marksheet-inner-border {
      border: 1.5px solid #451a03;
      padding: 16px 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .top-invocation {
      text-align: center;
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 3px;
      margin-bottom: 12px;
    }
    .marksheet-header-block {
      position: relative;
      text-align: center;
      margin-bottom: 6px;
      min-height: 100px;
    }
    .ms-logo-wrap {
      width: 100px;
      height: 115px;
      position: absolute;
      left: 4px;
      top: -10px;
    }
    .ms-logo-wrap .inst-seal-img {
      width: 100px;
      height: 115px;
      border-radius: 6px;
      object-fit: cover;
      border: 2px solid #D4AF37;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      background: #ffffff;
    }
    .inst-main-title {
      font-family: "Noto Serif Tamil", serif;
      font-size: 34px;
      font-weight: 900;
      color: #dc2626;
      margin: 0;
      line-height: 1.15;
      letter-spacing: 1px;
    }
    .inst-sub-title {
      font-family: "Noto Serif Tamil", serif;
      font-size: 22px;
      font-weight: 900;
      color: #854d0e;
      margin: 2px 0 0 0;
    }
    .inst-trust-reg {
      font-size: 12.5px;
      font-weight: 800;
      color: #dc2626;
      margin-top: 4px;
    }
    .ms-heading-ta {
      font-size: 13px;
      font-weight: 900;
      color: #000;
      margin: 2px 0 0 0;
    }
    .ms-heading-en {
      font-size: 11px;
      font-weight: 800;
      color: #000;
    }
    .ms-auth-line {
      font-size: 10px;
      color: #1e293b;
      margin-top: 1px;
    }
    .student-meta-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      border: 1px solid #000;
      margin: 8px 0;
      background: #fffdf5;
    }
    .meta-item {
      padding: 5px 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 12.5px;
    }
    .meta-item:nth-child(even) {
      border-left: 1px solid #cbd5e1;
    }
    .m-lbl {
      font-weight: 700;
      margin-right: 4px;
    }
    .m-val-ta {
      font-weight: 800;
      color: #b91c1c;
    }
    .m-val {
      font-weight: 700;
    }
    .m-val.code {
      font-family: monospace;
      font-weight: 800;
    }
    .m-sub {
      font-size: 11px;
      color: #334155;
    }
    .passport-photo-floating {
      border: 2px solid #334155;
      border-radius: 4px;
      padding: 2px;
      background: #fff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
    }
    .passport-photo-floating img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 2px;
    }
    .marks-table-banner {
      text-align: center;
      padding: 3px 0 5px 0;
    }
    .t-banner-ta {
      font-size: 13px;
      font-weight: 800;
      color: #000;
    }
    .t-banner-en {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .marks-official-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      border: 1px solid #000;
    }
    .marks-official-table th {
      border: 1px solid #000;
      background: #f1f5f9;
      padding: 5px 8px;
      font-weight: 800;
      text-align: center;
    }
    .marks-official-table td {
      border: 1px solid #000;
      padding: 6px 8px;
    }
    .text-center { text-align: center; }
    .mark-val { font-weight: 800; }
    .pass-tag { font-weight: 800; }
    .section-row td {
      background: #fafaf9;
      font-weight: 800;
      padding: 3px 6px;
    }
    .summary-total-row td, .summary-pct-row td, .summary-award-row td {
      background: #fffdf5;
      font-weight: 800;
    }
    .total-val { font-size: 13.5px; color: #0f172a; }
    .pct-val { font-size: 13.5px; color: #15803d; }
    .grade-val { font-size: 11px; color: #1e3a8a; }
    .award-val { color: #b91c1c; font-size: 13.5px; }
    .pass-criteria-notes {
      margin: 8px 0 10px 0;
      font-size: 10.5px;
      color: #334155;
      line-height: 1.4;
    }
    .marksheet-signatures-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      text-align: center;
      margin-top: 10px;
    }
    .sig-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sig-space {
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-img {
      max-height: 40px;
      max-width: 105px;
      object-fit: contain;
      display: inline-block;
    }
    .sig-role-ta {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .sig-role-en {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .no-print-toolbar { display: none !important; }
      .a4-page-sheet {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 6mm;
      }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</head>
<body>

  <div class="no-print-toolbar">
    <button onclick="window.print()" class="btn-action">
      🖨️ அச்சிடு / PDF சேமி (Print / Save as PDF)
    </button>
    <button onclick="window.close()" class="btn-close">
      ✖ மூடு (Close)
    </button>
  </div>

  <div class="a4-page-sheet">
    <div class="official-marksheet-layout">
      <div class="marksheet-outer-border">
        <div class="marksheet-inner-border">
          
          <div>
            <div class="top-invocation">ஓம் நமச்சிவாய</div>
            
            <div class="marksheet-header-block">
              <div class="ms-logo-wrap">
                <img src="{{ $logoBase64 }}" alt="Sri Aaruthraa Seal" class="inst-seal-img" />
              </div>
              <div class="inst-text-wrap" style="margin-top: -10px;">
                <h1 class="inst-main-title">ஸ்ரீ ஆருத்ரா</h1>
                <h2 class="inst-sub-title">ஜோதிட சாஸ்திர வித்யாலயம்</h2>
                <div class="inst-trust-reg">(அறக்கட்டளை அரசு பதிவு எண் : BK4/3/2018PKM)</div>
                <div class="ms-heading-ta">ஜோதிடவியல் தேர்வு மதிப்பெண் பட்டியல்</div>
                <div class="ms-heading-en">(ASTROLOGY COURSE EXAM MARK SHEET)</div>
                <div class="ms-auth-line">The Certified Mark Sheet under Authority of <strong>SRI AARUTHRAA JOTHIDA SASTHIRA VIDHYALAYAM</strong></div>
              </div>
            </div>

            <div style="display: flex; gap: 14px; margin: 6px 0; align-items: flex-start;">
              <div class="student-meta-grid" style="margin: 0; flex: 1;">
                <div class="meta-item">
                  <span class="m-lbl">மாணவர் பெயர்:</span>
                  <span class="m-val-ta">{{ $studentNameTa }}</span>
                  <div class="m-sub">(STUDENT NAME): <strong>{{ $studentNameEn }}</strong></div>
                </div>
                <div class="meta-item">
                  <span class="m-lbl">தேர்வு நாள்:</span>
                  <span class="m-val">{{ $examDate }}</span>
                  <div class="m-sub">(EXAM DATE): <strong>{{ $examDate }}</strong></div>
                </div>
                <div class="meta-item">
                  <span class="m-lbl">பதிவு எண்:</span>
                  <span class="m-val code">{{ $regNumber }}</span>
                  <div class="m-sub">(REGISTRATION NUMBER)</div>
                </div>
                <div class="meta-item">
                  <span class="m-lbl">கல்வியாண்டு:</span>
                  <span class="m-val">{{ $academicYear }}</span>
                  <div class="m-sub">(YEAR OF STUDY)</div>
                </div>
              </div>
              @if ($hasPhoto)
                <div class="passport-photo-floating" style="float:none; margin:0; flex-shrink:0; width:100px; height:120px; border:2px solid #334155;">
                  <img src="{{ $photoUrl }}" alt="Student" />
                </div>
              @endif
            </div>

            <div class="marks-table-banner">
              <div class="t-banner-ta">{{ $tbannerTa }}</div>
              <div class="t-banner-en">{{ $tbannerEn }}</div>
            </div>

            <table class="marks-official-table">
              <thead>
                <tr>
                  <th style="width: 10%;">வ. எண்<br><small>S.No</small></th>
                  <th style="width: 45%;">பாடப்பிரிவு<br><small>(SUBJECT)</small></th>
                  <th style="width: 25%;">மதிப்பெண் உள்ளடக்கம்<br><small>(TOTAL MARKS OBTAINED)</small></th>
                  <th style="width: 20%;">தேர்ச்சி நிலை<br><small>(PASSED OBTAINED)</small></th>
                </tr>
              </thead>
              <tbody>
                @php $sNo = 1; @endphp
                <tr>
                  <td class="text-center">{{ $sNo++ }}.</td>
                  <td>{{ $theory1Title }}</td>
                  <td class="text-center mark-val">{{ $theory1Mark }}</td>
                  <td class="text-center pass-tag" style="color: {{ $theory1Status === 'PASS' ? '#15803d' : '#dc2626' }};">{{ $theory1Status }}</td>
                </tr>

                @if ($hasMcq2)
                  <tr>
                    <td class="text-center">{{ $sNo++ }}.</td>
                    <td>{{ $theory2Title }}</td>
                    <td class="text-center mark-val">{{ $theory2Mark }}</td>
                    <td class="text-center pass-tag" style="color: {{ $theory2Status === 'PASS' ? '#15803d' : '#dc2626' }};">{{ $theory2Status }}</td>
                  </tr>
                @endif

                @if ($hasPracticals)
                  <tr class="section-row">
                    <td colspan="4"><strong>PRACTICAL (செய்முறை)</strong></td>
                  </tr>
                  <tr>
                    <td class="text-center">{{ $sNo++ }}.</td>
                    <td>{{ $p1Title }}</td>
                    <td class="text-center mark-val">{{ $practical1Mark }}</td>
                    <td class="text-center pass-tag" style="color: {{ $practical1Status === 'PASS' ? '#15803d' : '#dc2626' }};">{{ $practical1Status }}</td>
                  </tr>
                  @if ($hasPractical2)
                    <tr>
                      <td class="text-center">{{ $sNo++ }}.</td>
                      <td>செய்முறை பகுதி - II</td>
                      <td class="text-center mark-val">{{ $practical2Mark }}</td>
                      <td class="text-center pass-tag" style="color: {{ $practical2Status === 'PASS' ? '#15803d' : '#dc2626' }};">{{ $practical2Status }}</td>
                    </tr>
                  @endif
                  @if ($hasPractical3)
                    <tr>
                      <td class="text-center">{{ $sNo++ }}.</td>
                      <td>செய்முறை பகுதி - III</td>
                      <td class="text-center mark-val">{{ $practical3Mark }}</td>
                      <td class="text-center pass-tag" style="color: {{ $practical3Status === 'PASS' ? '#15803d' : '#dc2626' }};">{{ $practical3Status }}</td>
                    </tr>
                  @endif
                @endif

                <tr class="summary-total-row">
                  <td colspan="2"><strong>மொத்த மதிப்பெண்கள் (TOTAL MARKS)</strong></td>
                  <td class="text-center total-val"><strong>{{ $totalMarks }}</strong></td>
                  <td class="text-center pass-tag" style="color: {{ $passStatus === 'PASS' ? '#15803d' : '#dc2626' }};"><strong>{{ $passStatus }}</strong></td>
                </tr>
                <tr class="summary-pct-row">
                  <td colspan="2"><strong>பெற்ற சதவீத மதிப்பெண் (PERCENTAGE)</strong></td>
                  <td class="text-center pct-val"><strong>{{ $percentage }}</strong></td>
                  <td class="text-center grade-val"><strong>தகுதி: {{ $grade }}</strong></td>
                </tr>
                <tr class="summary-award-row">
                  <td colspan="2"><strong>வழங்கப்படும் சிறப்புப் பட்டம் (AWARDED TITLE)</strong></td>
                  <td colspan="2" class="text-center award-val"><strong>“{{ $awardTitleTa }}” ({{ $awardTitleEn }})</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="pass-criteria-notes">
              <div class="pass-crit-line">{{ $passCriteriaTheory }}</div>
              @if ($hasPracticals)
                <div class="pass-crit-line">{{ $passCriteriaPractical }}</div>
              @endif
            </div>
          </div>

          <div class="marksheet-signatures-grid">
            <div class="sig-box">
              <div class="sig-space">
                @if (!empty($sigStudent))
                  <img src="{{ $sigStudent }}" alt="Candidate Signature" class="sig-img" />
                @endif
              </div>
              <div class="sig-role-ta">மாணவர் கையொப்பம்:</div>
              <div class="sig-role-en">Candidates Certified</div>
            </div>
            <div class="sig-box">
              <div class="sig-space">
                @if (!empty($sigTeacher))
                  <img src="{{ $sigTeacher }}" alt="Teacher Signature" class="sig-img" />
                @endif
              </div>
              <div class="sig-role-ta">பயிற்சி ஆசிரியர்</div>
              <div class="sig-role-en">Training Teacher</div>
            </div>
            <div class="sig-box">
              <div class="sig-space">
                @if (!empty($sigSecretary))
                  <img src="{{ $sigSecretary }}" alt="Secretary Signature" class="sig-img" />
                @endif
              </div>
              <div class="sig-role-ta">செயலாளர்</div>
              <div class="sig-role-en">Secretary</div>
            </div>
            <div class="sig-box">
              <div class="sig-space">
                @if (!empty($sigFounder))
                  <img src="{{ $sigFounder }}" alt="Founder Signature" class="sig-img" />
                @endif
              </div>
              <div class="sig-role-ta">நிறுவனர்</div>
              <div class="sig-role-en">Founder</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

</body>
</html>
