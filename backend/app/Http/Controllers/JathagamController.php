<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JathagamController extends Controller
{
    // All 12 Tamil rasis in order
    private array $rasiList = [
        'மேஷம்',    // Mesha
        'ரிஷபம்',   // Rishabha
        'மிதுனம்',  // Mithuna
        'கடகம்',    // Kataka
        'சிம்மம்',  // Simha
        'கன்னி',    // Kanni
        'துலாம்',   // Thulam
        'விருச்சிகம்', // Vrichika
        'தனுசு',    // Dhanusu
        'மகரம்',    // Makara
        'கும்பம்',  // Kumbha
        'மீனம்',    // Meena
    ];

    // Category-specific fallback predictions
    private array $defaultPredictions = [
        'daily' => [
            'மேஷம்'       => 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.',
            'ரிஷபம்'      => 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
            'மிதுனம்'     => 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
            'கடகம்'       => 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.',
            'சிம்மம்'      => 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.',
            'கன்னி'       => 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.',
            'துலாம்'       => 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.',
            'விருச்சிகம்'  => 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.',
            'தனுசு'       => 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.',
            'மகரம்'       => 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.',
            'கும்பம்'      => 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.',
            'மீனம்'       => 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.'
        ],
        'weekly' => [
            'மேஷம்'       => 'இந்த வாரம் புதிய தொழில் முதலீடுகள் கைகூடும். குடும்பத்தில் சுப நிகழ்வுகள் நடைபெறும்.',
            'ரிஷபம்'      => 'இந்த வாரம் எதிர்பார்த்த பணவரவு தாராளமாக இருக்கும். உத்தியோகத்தில் பதவி உயர்வு கிட்டும்.',
            'மிதுனம்'     => 'இந்த வாரம் புதிய நட்பு மற்றும் தொழில் கூட்டாளிகள் அமைவார்கள். நீண்ட நாள் பிரச்சனைகள் தீரும்.',
            'கடகம்'       => 'இந்த வாரம் வீடு, மனை வாங்கும் யோகம் உண்டாகும். ஆரோக்கியத்தில் நல்ல முன்னேற்றம் ஏற்படும்.',
            'சிம்மம்'      => 'இந்த வாரம் உங்களின் செல்வாக்கு உயரும். புதிய பொறுப்புகள் தேடி வரும்.',
            'கன்னி'       => 'இந்த வாரம் வியாபாரத்தில் சிறப்பான லாபம் கிடைக்கும். உறவினர்களிடையே ஒற்றுமை பலப்படும்.',
            'துலாம்'       => 'இந்த வாரம் பணியிடத்தில் பாராட்டுகளும் எதிர்பார்த்த இடமாற்றமும் கிட்டும்.',
            'விருச்சிகம்'  => 'இந்த வாரம் திட்டமிட்ட காரியங்கள் அனைத்தும் தடையின்றி நிறைவேறும். நிதி நிலை உயரும்.',
            'தனுசு'       => 'இந்த வாரம் ஆன்மீகப் பயணங்கள் மற்றும் குடும்பத்துடன் மகிழ்ச்சியான பொழுதுபோக்குகள் அமையும்.',
            'மகரம்'       => 'இந்த வாரம் புதிய முயற்சிகளுக்கு நல்ல பலன் கிடைக்கும். எதிரிகள் விலகுவர்.',
            'கும்பம்'      => 'இந்த வாரம் நீண்ட நாட்களாக வராமல் இருந்த பாக்கிகள் வசூலாகும். சுபகாரியப் பேச்சுக்கள் நடக்கும்.',
            'மீனம்'       => 'இந்த வாரம் தொழில் கூட்டாளிகளிடம் இணக்கமான சூழல் நிலவும். வெளிநாட்டு வாய்ப்புகள் தேடி வரும்.'
        ],
        'monthly' => [
            'மேஷம்'       => 'இந்த மாதம் கிரகங்களின் சஞ்சாரம் சாதகமாக உள்ளது. நிலம் மற்றும் வாகனம் வாங்கும் யோகம் உண்டாகும்.',
            'ரிஷபம்'      => 'இந்த மாதம் வெளிநாட்டுப் பயணங்கள் மற்றும் தொழில் விரிவாக்க முயற்சிகள் வெற்றி பெறும்.',
            'மிதுனம்'     => 'இந்த மாதம் மாணவர்களுக்கு படிப்பில் சிறந்த முன்னேற்றம் காணப்படும். குடும்ப அமைதி காக்கப்படும்.',
            'கடகம்'       => 'இந்த மாதம் பொருளாதாரம் மிகச் சிறப்பாக இருக்கும். வங்கிக் கடன்கள் மற்றும் நிலுவைகள் தீரும்.',
            'சிம்மம்'      => 'இந்த மாதம் அரசு வழியில் எதிர்பார்த்த உதவிகளும் சலுகைகளும் தடையின்றி கிடைக்கும்.',
            'கன்னி'       => 'இந்த மாதம் குடும்பத்தில் சுபகாரியங்கள் இனிதே நடைபெறும். சுப விரயங்கள் ஏற்படும்.',
            'துலாம்'       => 'இந்த மாதம் புதிய தொழில் ஒப்பந்தங்கள் கையெழுத்தாகும். வருமானம் இருமடங்காக அதிகரிக்கும்.',
            'விருச்சிகம்'  => 'இந்த மாதம் உடல் ஆரோக்கியம் பலப்படும். குடும்பத்தினரின் தேவைகளை நிறைவேற்றுவீர்கள்.',
            'தனுசு'       => 'இந்த மாதம் உத்தியோகத்தில் உயர் அதிகாரிகளின் முழு ஆதரவும் ஊதிய உயர்வும் கிடைக்கும்.',
            'மகரம்'       => 'இந்த மாதம் பூர்வீக சொத்து பிரச்சனைகள் சுமூகமாக முடிவுக்கு வரும்.',
            'கும்பம்'      => 'இந்த மாதம் ஆன்மீக நாட்டம் அதிகரிக்கும். தொட்டதெல்லாம் பொன்னாகும் பொற்காலம்.',
            'மீனம்'       => 'இந்த மாதம் வியாபாரத்தில் புதிய வாடிக்கையாளர்கள் கிடைப்பார்கள். செல்வாக்கு கூடும்.'
        ],
        'yearly' => [
            'மேஷம்'       => 'இந்த ஆண்டு குரு மற்றும் சனி பெயர்ச்சியால் பெரும் நற்பலன்களும் செல்வச் செழிப்பும் உண்டாகும்.',
            'ரிஷபம்'      => 'இந்த ஆண்டு புதிய தொழில் தொடங்குதல் மற்றும் திருமண யோகம் கைகூடும் அற்புத ஆண்டாக அமையும்.',
            'மிதுனம்'     => 'இந்த ஆண்டு தொழில் மற்றும் உத்தியோகத்தில் மிகப்பெரிய திருப்புமுனைகளும் பொருளாதார முன்னேற்றமும் ஏற்படும்.',
            'கடகம்'       => 'இந்த ஆண்டு சொந்த வீடு கட்டும் கனவு நனவாகும். குழந்தைகள் வழியில் பெருமை சேரும்.',
            'சிம்மம்'      => 'இந்த ஆண்டு சமுதாயத்தில் மிக உயர்ந்த அந்தஸ்தும் கௌரவமும் கிடைக்கப்பெறும் அதிர்ஷ்ட ஆண்டு.',
            'கன்னி'       => 'இந்த ஆண்டு வெளிநாடு சென்று கல்வி பயில அல்லது பணிபுரிய விரும்பியவர்களுக்கு யோகம் கிட்டும்.',
            'துலாம்'       => 'இந்த ஆண்டு தடைபட்ட காரியங்கள் அனைத்தும் சுபமாக முடிந்து புதிய பாதை பிறக்கும்.',
            'விருச்சிகம்'  => 'இந்த ஆண்டு வியாபாரத்தில் அபார வளர்ச்சி கண்டு பல கிளைகள் தொடங்கும் யோகம் உண்டாகும்.',
            'தனுசு'       => 'இந்த ஆண்டு நிதி நிலைமை பன்மடங்கு உயர்ந்து கடன் சுமைகள் முற்றிலும் விலகும்.',
            'மகரம்'       => 'இந்த ஆண்டு உழைப்பிற்கேற்ற உன்னதமான பலன்களும் குடும்பத்தில் மகிழ்ச்சியும் பெருகும்.',
            'கும்பம்'      => 'இந்த ஆண்டு புண்ணிய காரியங்கள் செய்வீர்கள். சமூகத்தில் நற்பெயர் நிலைநாட்டப்படும்.',
            'மீனம்'       => 'இந்த ஆண்டு தொழில் ரீதியான புதிய சகாப்தம் தொடங்கும். சகல சௌபாக்கியங்களும் கிட்டும்.'
        ]
    ];

    // Porutham names (10 Porutham matching criteria)
    private array $poruthams = [
        'Dinam', 'Ganam', 'Mahendram', 'Stree Deergham',
        'Yoni', 'Rasi', 'Rajju', 'Vedhai', 'Vasiyam', 'Rasi Adhipathi'
    ];

    /**
     * Get all 12 rasi predictions (public)
     */
    public function getRasiPalan(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));
        $type = $request->input('type', 'daily'); // daily, weekly, monthly, yearly

        // 1. Try to find predictions for specific date & type
        $dbPredictions = DB::table('rasi_palans')
            ->where('prediction_date', $date)
            ->where('tab_type', $type)
            ->whereIn('rasi_name', $this->rasiList)
            ->get()
            ->keyBy('rasi_name');

        // 2. If nothing for exact date, check latest updated for this tab_type
        if ($dbPredictions->isEmpty()) {
            $dbPredictions = DB::table('rasi_palans')
                ->where('tab_type', $type)
                ->whereIn('rasi_name', $this->rasiList)
                ->orderBy('prediction_date', 'desc')
                ->orderBy('updated_at', 'desc')
                ->get()
                ->keyBy('rasi_name');
        }

        $fallbackMap = $this->defaultPredictions[$type] ?? $this->defaultPredictions['daily'];

        // 3. Guarantee ordered array of all 12 rasis
        $orderedPredictions = [];
        foreach ($this->rasiList as $rasi) {
            if (isset($dbPredictions[$rasi])) {
                $item = $dbPredictions[$rasi];
                $orderedPredictions[] = [
                    'rasi_name'       => $rasi,
                    'tab_type'        => $type,
                    'prediction_text' => (string) ($item->prediction_text ?? ($fallbackMap[$rasi] ?? '')),
                    'audio_url'       => $item->audio_url ?? null,
                    'video_url'       => $item->video_url ?? null,
                    'prediction_date' => $item->prediction_date ?? $date
                ];
            } else {
                $orderedPredictions[] = [
                    'rasi_name'       => $rasi,
                    'tab_type'        => $type,
                    'prediction_text' => $fallbackMap[$rasi] ?? 'ராசி பலன் விரைவில் வெளியிடப்படும்.',
                    'audio_url'       => null,
                    'video_url'       => null,
                    'prediction_date' => $date
                ];
            }
        }

        return response()->json([
            'date'        => $date,
            'type'        => $type,
            'predictions' => $orderedPredictions,
            'palans'      => $orderedPredictions,
            'rasi_list'   => $this->rasiList
        ]);
    }

    /**
     * Calculate Marriage Porutham (10-point matching)
     */
    public function calculateMatch(Request $request)
    {
        $request->validate([
            'boy_name'      => 'required|string',
            'boy_dob'       => 'required|date',
            'boy_rasi'      => 'required|string',
            'boy_nakshatra' => 'required|string',
            'girl_name'     => 'required|string',
            'girl_dob'      => 'required|date',
            'girl_rasi'     => 'required|string',
            'girl_nakshatra'=> 'required|string',
        ]);

        // Porutham calculation using Rasi index positions
        $boyRasiIndex  = array_search($request->boy_rasi, $this->rasiList) ?? 0;
        $girlRasiIndex = array_search($request->girl_rasi, $this->rasiList) ?? 0;
        $diff = abs($boyRasiIndex - $girlRasiIndex);

        // Simplified porutham scoring based on Rasi distance (classical Tamil astrology rules)
        $matchDetails = [];
        $totalScore   = 0;

        $poruthamsDef = [
            'Dinam'          => ['tamil' => 'தினப் பொருத்தம்', 'desc' => 'ஆயுள், உடல் ஆரோக்கியம்', 'score' => in_array($diff % 9, [1, 3, 5, 7]) ? 1 : 0],
            'Ganam'          => ['tamil' => 'கணப் பொருத்தம்', 'desc' => 'குண ஒற்றுமை, சுபாவம்', 'score' => $this->calcGanam($request->boy_nakshatra, $request->girl_nakshatra)],
            'Mahendram'      => ['tamil' => 'மகேந்திரப் பொருத்தம்', 'desc' => 'புத்திர பாக்கியம், வம்ச விருத்தி', 'score' => ($diff % 4 === 0) ? 1 : 0],
            'Stree Deergham' => ['tamil' => 'ஸ்திரீ தீர்க்கம்', 'desc' => 'சகல ஐஸ்வர்யம், லட்சுமி கடாட்சம்', 'score' => ($diff >= 7) ? 1 : 0],
            'Yoni'           => ['tamil' => 'யோனிப் பொருத்தம்', 'desc' => 'தாம்பத்ய சுகம், மன ஈர்ப்பு', 'score' => 1],
            'Rasi'           => ['tamil' => 'இராசிப் பொருத்தம்', 'desc' => 'குடும்ப ஒற்றுமை, சுப விருத்தி', 'score' => ($diff % 7 !== 0) ? 1 : 0],
            'Rasi Adhipathi' => ['tamil' => 'இராசி அதிபதி பொருத்தம்', 'desc' => 'கிரக நட்பு, சமாதானம்', 'score' => ($diff % 2 === 0) ? 1 : 0],
            'Vasiyam'        => ['tamil' => 'வசியப் பொருத்தம்', 'desc' => 'அன்யோன்யம், ஈர்ப்பு', 'score' => in_array($diff, [2, 4, 6]) ? 1 : 0],
            'Rajju'          => ['tamil' => 'ரஜ்ஜுப் பொருத்தம்', 'desc' => 'மாங்கல்ய பலம் (அதி முக்கியம்)', 'score' => ($diff % 3 !== 0) ? 1 : 0],
            'Vedhai'         => ['tamil' => 'வேதைப் பொருத்தம்', 'desc' => 'துன்பமின்மை, பகையற்ற நிலை', 'score' => ($diff !== 6 && $diff !== 8) ? 1 : 0],
        ];

        $matchDetails = [];
        $totalScore   = 0;

        if ($request->has('match_details') && is_array($request->input('match_details')) && count($request->input('match_details')) > 0) {
            $rawDetails = $request->input('match_details');
            foreach ($rawDetails as $item) {
                $isMatched = !empty($item['match']) || (!empty($item['score']) && $item['score'] == 1) || (!empty($item['points']) && $item['points'] == 1);
                $matchDetails[] = [
                    'name'       => $item['name'] ?? 'Porutham',
                    'tamil_name' => $item['tamil_name'] ?? ($poruthamsDef[$item['name'] ?? '']['tamil'] ?? ($item['name'] ?? '')),
                    'desc'       => $item['desc'] ?? ($poruthamsDef[$item['name'] ?? '']['desc'] ?? ''),
                    'match'      => $isMatched,
                    'result'     => $isMatched ? 'Match' : 'No Match',
                    'score'      => $isMatched ? 1 : 0
                ];
                if ($isMatched) {
                    $totalScore++;
                }
            }
        } else {
            foreach ($poruthamsDef as $name => $meta) {
                $isMatched = $meta['score'] === 1;
                $matchDetails[] = [
                    'name'       => $name,
                    'tamil_name' => $meta['tamil'],
                    'desc'       => $meta['desc'],
                    'match'      => $isMatched,
                    'result'     => $isMatched ? 'Match' : 'No Match',
                    'score'      => $meta['score']
                ];
                $totalScore += $meta['score'];
            }
        }

        if ($request->has('match_score') && is_numeric($request->input('match_score'))) {
            $totalScore = intval($request->input('match_score'));
        }

        $totalPoruthams = count($matchDetails);
        $matchStatus = $request->input('match_status') ?: ($totalScore >= 6 ? 'Match' : 'Low Match');
        $verdict = $request->input('verdict') ?: ($totalScore >= 8 ? '🟢 மிக உன்னதமான பொருத்தம்' : ($totalScore >= 6 ? '🟢 நல்ல பொருத்தம்' : '🟡 சுமாரான பொருத்தம்'));

        // Save to DB
        $userId = null;
        try {
            if ($request->bearerToken()) {
                $token = DB::table('personal_access_tokens')
                    ->where('token', hash('sha256', $request->bearerToken()))
                    ->first();
                $userId = $token?->tokenable_id;
            }
        } catch (\Exception $e) {}

        $id = DB::table('marriage_matches')->insertGetId([
            'user_id'         => $userId,
            'request_type'    => $request->input('request_type', 'pair_match'),
            'requester_phone' => $request->input('requester_phone'),
            'boy_name'        => $request->boy_name,
            'boy_dob'         => $request->boy_dob,
            'boy_tob'         => $request->input('boy_tob'),
            'boy_pob'         => $request->input('boy_pob'),
            'boy_rasi'        => $request->boy_rasi,
            'boy_nakshatra'   => $request->boy_nakshatra,
            'boy_photo'       => $request->input('boy_photo'),
            'boy_jadhagam'    => $request->input('boy_jadhagam'),
            'girl_name'       => $request->girl_name,
            'girl_dob'        => $request->girl_dob,
            'girl_tob'        => $request->input('girl_tob'),
            'girl_pob'        => $request->input('girl_pob'),
            'girl_rasi'       => $request->girl_rasi,
            'girl_nakshatra'  => $request->girl_nakshatra,
            'girl_photo'      => $request->input('girl_photo'),
            'girl_jadhagam'   => $request->input('girl_jadhagam'),
            'match_score'     => $totalScore,
            'match_status'    => $matchStatus,
            'verdict'         => $verdict,
            'match_details'   => json_encode($matchDetails),
            'created_at'      => now(),
            'updated_at'      => now()
        ]);

        return response()->json([
            'success'       => true,
            'match_id'      => $id,
            'boy_name'      => $request->boy_name,
            'girl_name'     => $request->girl_name,
            'match_score'   => $totalScore,
            'match_status'  => $matchStatus,
            'verdict'       => $verdict,
            'match_details' => $matchDetails,
            'message'       => $totalScore >= 6
                ? "நல்ல பொருத்தம்! {$totalScore}/{$totalPoruthams} பொருத்தங்கள் உள்ளன."
                : "சுமாரான பொருத்தம். {$totalScore}/{$totalPoruthams} மட்டுமே பொருந்துகின்றன."
        ]);
    }

    /**
     * Get user's past marriage match records (auth required)
     */
    public function getMyMatches(Request $request)
    {
        $user = $request->user();
        $matches = DB::table('marriage_matches')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                $m->match_details = json_decode($m->match_details);
                return $m;
            });

        return response()->json(['matches' => $matches]);
    }

    /**
     * Para-Jathagam — Get prediction for another person
     */
    public function paraJathagamReading(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'dob'  => 'required|date',
            'rasi' => 'required|string',
        ]);

        // Get prediction for this rasi from today's rasi_palans
        $today = date('Y-m-d');
        $prediction = DB::table('rasi_palans')
            ->where('rasi_name', $request->rasi)
            ->where('tab_type', 'daily')
            ->where('prediction_date', $today)
            ->first();

        $predictionText = $prediction?->prediction_text
            ?? 'இந்த ராசிக்கான இன்றைய பலன் விரைவில் வெளியிடப்படும்.';

        return response()->json([
            'name'            => $request->name,
            'dob'             => $request->dob,
            'rasi'            => $request->rasi,
            'nakshatra'       => $request->input('nakshatra', 'N/A'),
            'prediction_text' => $predictionText,
            'rasi_list'       => $this->rasiList
        ]);
    }

    /**
     * Save user's own jathagam details (auth required)
     */
    public function saveMyJathagam(Request $request)
    {
        $request->validate([
            'dob'       => 'required|date',
            'tob'       => 'nullable|string',
            'pob'       => 'nullable|string',
            'rasi'      => 'required|string',
            'nakshatra' => 'nullable|string',
            'lagnam'    => 'nullable|string',
            'gender'    => 'nullable|string'
        ]);

        $user = $request->user();

        $jathagamData = [
            'dob'       => $request->dob,
            'tob'       => $request->tob,
            'pob'       => $request->pob,
            'rasi'      => $request->rasi,
            'nakshatra' => $request->nakshatra,
            'lagnam'    => $request->lagnam,
            'gender'    => $request->gender
        ];

        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'jathagam_details' => json_encode($jathagamData),
                'updated_at'       => now()
            ]);

        return response()->json([
            'success'         => true,
            'message'         => 'ஜாதக விவரங்கள் சேமிக்கப்பட்டன.',
            'jathagam_details'=> $jathagamData
        ]);
    }

    /**
     * Get user's own saved jathagam (auth required)
     */
    public function getMyJathagam(Request $request)
    {
        $user   = $request->user();
        $dbUser = DB::table('users')->where('id', $user->id)->first();

        return response()->json([
            'jathagam_details' => $dbUser->jathagam_details
                ? json_decode($dbUser->jathagam_details)
                : null,
            'rasi_list'        => $this->rasiList
        ]);
    }

    // ---- Admin Endpoints ----

    /**
     * Admin: Get all Marriage Match & Single Profile Search requests
     */
    public function adminGetMatches()
    {
        $matches = DB::table('marriage_matches')
            ->leftJoin('users', 'marriage_matches.user_id', '=', 'users.id')
            ->select(
                'marriage_matches.*',
                'users.name as user_account_name',
                'users.phone as user_account_phone',
                'users.email as user_account_email'
            )
            ->orderBy('marriage_matches.created_at', 'desc')
            ->get()
            ->map(function ($m) {
                $m->match_details = json_decode($m->match_details);
                $m->admin_status = $m->admin_status ?: 'Pending';
                $m->consultation_status = $m->admin_status;
                $m->contact_phone = $m->requester_phone ?: ($m->user_account_phone ?: '');
                $m->requester_display = $m->user_account_name ?: ($m->requester_phone ? 'Phone: ' . $m->requester_phone : 'பதிவு செய்யாத பயனர் (Guest)');
                return $m;
            });

        return response()->json(['matches' => $matches]);
    }

    /**
     * Admin: Update match request consultation status and notes
     */
    public function adminUpdateMatch(Request $request, $id)
    {
        $adminStatus = $request->input('admin_status') ?? $request->input('consultation_status') ?? 'Pending';
        $adminNotes  = $request->input('admin_notes') ?? '';

        DB::table('marriage_matches')
            ->where('id', $id)
            ->update([
                'admin_status' => $adminStatus,
                'admin_notes'  => $adminNotes,
                'updated_at'   => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Consultation status and notes updated successfully'
        ]);
    }

    /**
     * Admin: Delete a Marriage Match or Varan Search record
     */
    public function adminDeleteMatch($id)
    {
        DB::table('marriage_matches')->where('id', $id)->delete();
        return response()->json([
            'success' => true,
            'message' => "கோரிக்கை (#{$id}) வெற்றிகரமாக நீக்கப்பட்டது (Record deleted successfully)."
        ]);
    }

    /**
     * Submit Single Profile Varan Search (வரன் தேடல் - Looking for Bride / Groom)
     */
    public function submitVaranSearch(Request $request)
    {
        $request->validate([
            'candidate_gender' => 'required|string', // groom (மணமகன் தேவை / seeking groom), bride (மணமகள் தேவை / seeking bride)
            'candidate_name'   => 'required|string',
            'candidate_dob'    => 'required|date',
            'candidate_rasi'   => 'required|string',
            'candidate_star'   => 'required|string',
            'contact_phone'    => 'required|string'
        ]);

        $userId = null;
        try {
            if ($request->bearerToken()) {
                $token = DB::table('personal_access_tokens')
                    ->where('token', hash('sha256', $request->bearerToken()))
                    ->first();
                $userId = $token?->tokenable_id;
            }
        } catch (\Exception $e) {}

        $isGroom = strtolower($request->candidate_gender) === 'groom';

        $id = DB::table('marriage_matches')->insertGetId([
            'user_id'          => $userId,
            'request_type'     => 'single_search',
            'candidate_gender' => $request->candidate_gender,
            'requester_phone'  => $request->contact_phone,
            'boy_name'         => $isGroom ? null : $request->candidate_name,
            'boy_dob'          => $isGroom ? null : $request->candidate_dob,
            'boy_tob'          => $isGroom ? null : $request->input('candidate_tob'),
            'boy_pob'          => $isGroom ? null : $request->input('candidate_pob'),
            'boy_rasi'         => $isGroom ? null : $request->candidate_rasi,
            'boy_nakshatra'    => $isGroom ? null : $request->candidate_star,
            'girl_name'        => $isGroom ? $request->candidate_name : null,
            'girl_dob'         => $isGroom ? $request->candidate_dob : null,
            'girl_tob'         => $isGroom ? $request->input('candidate_tob') : null,
            'girl_pob'         => $isGroom ? $request->input('candidate_pob') : null,
            'girl_rasi'        => $isGroom ? $request->candidate_rasi : null,
            'girl_nakshatra'   => $isGroom ? $request->candidate_star : null,
            'education_job'    => $request->input('education_job'),
            'preferences'      => $request->input('preferences'),
            'match_score'      => 0,
            'match_status'     => 'Searching',
            'admin_status'     => 'Pending',
            'admin_notes'      => null,
            'match_details'    => json_encode([]),
            'created_at'       => now(),
            'updated_at'       => now()
        ]);

        return response()->json([
            'success'  => true,
            'id'       => $id,
            'message'  => 'உங்கள் வரன் தேடல் கோரிக்கை வெற்றிகரமாக பதிவு செய்யப்பட்டது! எங்கள் தலைமை ஜோதிடர் விரைவில் உங்களை தொலைபேசியில் தொடர்பு கொண்டு பொருத்தமான வரன்களை பரிந்துரைப்பார்.'
        ]);
    }

    // ---- Helpers ----

    private function calcGanam(string $boyNak, string $girlNak): int
    {
        // Simplified — Deva Ganam pairs are compatible; in real, need a full nakshatra->gana table
        $devaGana = ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'];
        $boyDeva  = in_array($boyNak, $devaGana);
        $girlDeva = in_array($girlNak, $devaGana);
        return ($boyDeva && $girlDeva) || (!$boyDeva && !$girlDeva) ? 1 : 0;
    }
}
