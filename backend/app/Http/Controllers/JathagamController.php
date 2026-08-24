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

        // 3. Guarantee ordered array of all 12 rasis
        $orderedPredictions = [];
        foreach ($this->rasiList as $rasi) {
            if (isset($dbPredictions[$rasi])) {
                $item = $dbPredictions[$rasi];
                $orderedPredictions[] = [
                    'rasi_name'       => $rasi,
                    'tab_type'        => $type,
                    'prediction_text' => (string) ($item->prediction_text ?? ''),
                    'audio_url'       => $item->audio_url ?? null,
                    'video_url'       => $item->video_url ?? null,
                    'prediction_date' => $item->prediction_date ?? $date
                ];
            } else {
                $orderedPredictions[] = [
                    'rasi_name'       => $rasi,
                    'tab_type'        => $type,
                    'prediction_text' => '',
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
     * Get a specific marriage match by ID
     */
    public function getMatch($id)
    {
        $match = DB::table('marriage_matches')->where('id', $id)->first();
        if (!$match) {
            return response()->json(['success' => false, 'message' => 'Match not found'], 404);
        }

        return response()->json([
            'success' => true,
            'match' => $match
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

        $updateData = [
            'admin_status' => $adminStatus,
            'admin_notes'  => $adminNotes,
            'updated_at'   => now()
        ];
        
        if ($request->has('result_document')) {
            $updateData['result_document'] = $request->input('result_document');
        }

        DB::table('marriage_matches')
            ->where('id', $id)
            ->update($updateData);

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
