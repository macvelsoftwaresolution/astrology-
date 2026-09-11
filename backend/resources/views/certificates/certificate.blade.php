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

    .official-cert-layout {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .ornate-outer-border {
      border: 10px double #C48E2E;
      padding: 5px;
      background: #fffdf9;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .ornate-inner-border {
      border: 2px solid #8e2a37;
      padding: 24px 28px;
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
    .inst-header-block {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 8px;
    }
    .inst-logo-wrap {
      position: absolute;
      left: 4px;
      top: 0;
    }
    .inst-seal-img {
      width: 98px;
      height: 98px;
      border-radius: 8px;
      object-fit: cover;
      border: 3px solid #D4AF37;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
      background: #ffffff;
    }
    .inst-text-wrap {
      text-align: center;
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
    .inst-address {
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }
    .inst-email {
      font-size: 10.5px;
      font-weight: 700;
      color: #1d4ed8;
      margin-top: 1px;
    }
    .ribbon-banner-wrap {
      text-align: center;
      margin: 12px 0 16px 0;
    }
    .ribbon-pill {
      display: inline-block;
      background: linear-gradient(180deg, #1e3a8a, #0f172a);
      color: #fef08a;
      font-size: 16px;
      font-weight: 900;
      padding: 7px 40px;
      border-radius: 20px;
      border: 1.5px solid #facc15;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .pg-merit-title {
      text-align: center;
      font-size: 14px;
      font-weight: 800;
      color: #b91c1c;
      font-style: italic;
      font-family: "Playfair Display", Georgia, serif;
      text-decoration: underline;
      margin-top: 4px;
    }
    .cert-body-flow {
      position: relative;
      clear: both;
      margin-bottom: 18px;
    }
    .passport-photo-floating {
      float: right;
      width: 90px;
      height: 112px;
      border: 2px solid #8e2a37;
      border-radius: 4px;
      padding: 2px;
      background: #fff;
      margin: 0 0 8px 16px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
    }
    .passport-photo-floating img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 2px;
    }
    .reg-no-line {
      font-size: 14.5px;
      font-weight: 800;
      color: #047857;
      margin-bottom: 8px;
    }
    .val-reg {
      font-family: monospace;
      font-weight: 900;
      font-size: 15.5px;
      margin-left: 5px;
      color: #047857;
    }
    .tamil-flow-para {
      font-size: 15px;
      line-height: 2.1;
      color: #0f172a;
      text-align: justify;
      text-justify: inter-word;
      text-indent: 30px;
    }
    .fill-line {
      font-weight: 800;
      color: #b91c1c;
      border-bottom: 1.5px dotted #334155;
      padding: 0 4px;
    }
    .awarded-title-box {
      text-align: center;
      clear: both;
      margin: 16px 0;
    }
    .title-tamil {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      color: #dc2626;
      letter-spacing: 1px;
    }
    .title-sub-ta {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 3px;
    }
    .cert-statement-english {
      margin-bottom: 16px;
    }
    .eng-para {
      font-size: 14px;
      line-height: 1.95;
      color: #0f172a;
      text-align: justify;
      text-justify: inter-word;
      text-indent: 30px;
    }
    .eng-sub-statement {
      font-size: 13px;
      line-height: 1.8;
      color: #334155;
      font-style: italic;
      margin-top: 4px;
      text-indent: 30px;
    }
    .eng-title-highlight {
      text-align: center;
      font-size: 26px;
      font-weight: 900;
      color: #dc2626;
      margin: 10px 0 2px 0;
    }
    .eng-congrats {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      color: #15803d;
      font-style: italic;
      font-family: "Playfair Display", Georgia, serif;
    }
    .cert-bottom-section {
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 14px;
      margin-top: auto;
    }
    .date-place-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .signatures-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      text-align: center;
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
    <div class="official-cert-layout">
      <div class="ornate-outer-border">
        <div class="ornate-inner-border">
          
          <div>
            <div class="top-invocation">ஓம் நமச்சிவாய</div>
            <div class="inst-header-block">
              <div class="inst-logo-wrap">
                <img src="{{ $logoBase64 }}" alt="Sri Aaruthraa Seal" class="inst-seal-img" />
              </div>
              <div class="inst-text-wrap">
                <h1 class="inst-main-title">ஸ்ரீ ஆருத்ரா</h1>
                <h2 class="inst-sub-title">ஜோதிட சாஸ்திர வித்யாலயம்</h2>
                <div class="inst-trust-reg">அறக்கட்டளை அரசு பதிவு எண் : (BK4/3/2018PKM)</div>
                <div class="inst-address">எண் : 1/346,ஸ்டேட் பாங்க் காலனி, சுந்தரராஜநகர், கீழவடகரை, பெரியகுளம் – 625 605, தேனி மாவட்டம்.</div>
                <div class="inst-email">(www.sriaaruthraaastro@gmail.com)</div>
              </div>
            </div>

            <div class="ribbon-banner-wrap">
              <div class="ribbon-pill">{{ $courseLvlText }}</div>
              @if ($isPG)
                <div class="pg-merit-title">Meritorius Certificate</div>
              @endif
            </div>
          </div>

          <div class="cert-body-flow">
            @if ($hasPhoto)
              <div class="passport-photo-floating">
                <img src="{{ $photoUrl }}" alt="Photo" />
              </div>
            @endif

            <div class="reg-no-line">
              <span class="lbl-ta">பதிவு எண் :</span> 
              <span class="val-reg">{{ $regNumber }}</span>
            </div>

            <div class="tamil-flow-para">
              @if ($isPG)
                திரு / திருமதி <span class="fill-line name">{{ $studentNameTa }}</span> என்பவர் நமது 
                <strong>ஸ்ரீ ஆருத்ரா ஜோதிட சாஸ்திர வித்யாலயத்தின்</strong> <span class="fill-line center">{{ $centerName }}</span> மையத்தில், 
                ஜோதிடவியல் வித்தக மேல்நிலை சாஸ்திர கல்வி பயிற்சியான <span class="fill-line date">{{ $coursePeriodFrom }}</span> முதல் 
                <span class="fill-line date">{{ $coursePeriodTo }}</span> வரை நடைபெற்ற 
                முதுநிலை பயிற்சியை வெற்றிகரமாக நிறைவு செய்து <span class="fill-line date">{{ $examDate }}</span> ஆண்டில் 
                நடைபெற்ற பொதுத் தேர்வில் கலந்து கொண்டு தேர்ச்சி பெற்றமைக்காக அவரை பாராட்டி சான்றளிப்பதுடன்
              @else
                திரு / திருமதி <span class="fill-line name">{{ $studentNameTa }}</span> என்பவர் 
                எமது <strong>ஸ்ரீ ஆருத்ரா ஜோதிட வித்யாலயத்தின்</strong> <span class="fill-line center">{{ $centerName }}</span> மையத்தில், 
                ஜோதிடவியல் சாஸ்திர கல்வி பயிற்சியான <span class="fill-line date">{{ $coursePeriodFrom }}</span> முதல் 
                <span class="fill-line date">{{ $coursePeriodTo }}</span> வரை நடைபெற்ற 
                இளநிலை பயிற்சியை வெற்றிகரமாக நிறைவு செய்து <span class="fill-line date">{{ $examDate }}</span> ஆண்டில் 
                நடைபெற்ற பொதுத்தேர்வில் கலந்து கொண்டு தேர்ச்சி பெற்றமைக்காக சான்றளிப்பதுடன்
              @endif
            </div>

            <div class="awarded-title-box">
              <h2 class="title-tamil">“{{ $awardTitleTa }}”</h2>
              <div class="title-sub-ta">{{ $titleSubTa }}</div>
            </div>

            <div class="cert-statement-english">
              @if ($isPG)
                <div class="eng-para">
                  We Certify that <span class="fill-line name">{{ $studentNameEn }}</span> Studied in our 
                  <strong>SRI AARUTHRAA JOTHIDA SASTHIRA VIDHYALAYAM</strong> has Successfully Completed the Post Graduate Astrology Course, During the Period from 
                  <span class="fill-line date">{{ $coursePeriodFrom }}</span> to 
                  <span class="fill-line date">{{ $coursePeriodTo }}</span> at 
                  <span class="fill-line center">{{ $centerNameEn }}</span> Centre and Passed the Public higher Examination Conducted on 
                  <span class="fill-line date">{{ $examDate }}</span>.
                </div>
                <div class="eng-sub-statement">
                  He has brought forward the full efforts of Studies in Astrology and rendered an exemplary learning the course. Hence he is awarded with great pleasure and proud the rich Title.
                </div>
              @else
                <div class="eng-para">
                  We Certify that <span class="fill-line name">{{ $studentNameEn }}</span> has successfully Completed 
                  the Undergraduate Astrology Course during the Period from 
                  <span class="fill-line date">{{ $coursePeriodFrom }}</span> to 
                  <span class="fill-line date">{{ $coursePeriodTo }}</span> at 
                  <span class="fill-line center">{{ $centerNameEn }}</span> Centre, and passed the Examination conducted on 
                  <span class="fill-line date">{{ $examDate }}</span> with great pleasure and proud we award him a title.
                </div>
              @endif
              <div class="eng-title-highlight">“{{ $awardTitleEn }}”</div>
              <div class="eng-congrats">{{ $engCongrats }}</div>
            </div>
          </div>

          <div class="cert-bottom-section">
            <div class="date-place-row">
              <div class="dp-item"><strong>நாள் :</strong> {{ $issueDate }}</div>
              <div class="dp-item"><strong>இடம் :</strong> {{ $issuePlace }}</div>
            </div>

            <div class="signatures-grid-4">
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
                  @if (!empty($sigTreasurer))
                    <img src="{{ $sigTreasurer }}" alt="Treasurer Signature" class="sig-img" />
                  @endif
                </div>
                <div class="sig-role-ta">பொருளாளர்</div>
                <div class="sig-role-en">Treasurer</div>
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
  </div>

</body>
</html>
