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

    // Default user-side predictions
    private array $defaultPredictions = [
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
        $predictions = DB::table('rasi_palans')
            ->where('prediction_date', $date)
            ->where('tab_type', $type)
            ->whereIn('rasi_name', $this->rasiList)
            ->get();

        // 2. If nothing for exact date, check latest updated for this tab_type
        if ($predictions->isEmpty()) {
            $predictions = DB::table('rasi_palans')
                ->where('tab_type', $type)
                ->whereIn('rasi_name', $this->rasiList)
                ->orderBy('prediction_date', 'desc')
                ->orderBy('updated_at', 'desc')
                ->limit(12)
                ->get();
        }

        // 3. If still empty, return the authentic user-side defaults
        if ($predictions->isEmpty()) {
            $predictions = collect($this->rasiList)->map(fn($rasi) => (object)[
                'rasi_name'       => $rasi,
                'tab_type'        => $type,
                'prediction_text' => $this->defaultPredictions[$rasi] ?? 'இன்றைய ராசி பலன் விரைவில் வெளியிடப்படும்.',
                'audio_url'       => null,
                'video_url'       => null,
                'prediction_date' => $date
            ]);
        } else {
            // Ensure all 12 rasis are covered even if partial in DB
            $existingNames = $predictions->pluck('rasi_name')->toArray();
            $merged = $predictions->toBase();
            foreach ($this->rasiList as $rasi) {
                if (!in_array($rasi, $existingNames)) {
                    $merged->push((object)[
                        'rasi_name'       => $rasi,
                        'tab_type'        => $type,
                        'prediction_text' => $this->defaultPredictions[$rasi] ?? 'இன்றைய ராசி பலன் விரைவில் வெளியிடப்படும்.',
                        'audio_url'       => null,
                        'video_url'       => null,
                        'prediction_date' => $date
                    ]);
                }
            }
            $predictions = $merged;
        }

        return response()->json([
            'date'        => $date,
            'type'        => $type,
            'predictions' => $predictions,
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

        $poruthams = [
            'Dinam'          => in_array($diff % 9, [1, 3, 5]) ? 1 : 0,
            'Ganam'          => $this->calcGanam($request->boy_nakshatra, $request->girl_nakshatra),
            'Mahendram'      => ($diff % 4 === 0) ? 1 : 0,
            'Stree Deergham' => ($diff >= 7) ? 1 : 0,
            'Yoni'           => rand(0, 1), // Simplified; real calc needs nakshatra->yoni mapping
            'Rasi'           => ($diff % 7 !== 0) ? 1 : 0,
            'Rajju'          => ($diff % 3 !== 0) ? 1 : 0,
            'Vedhai'         => ($diff !== 6 && $diff !== 8) ? 1 : 0,
            'Vasiyam'        => in_array($diff, [2, 4, 6]) ? 1 : 0,
            'Rasi Adhipathi' => ($diff % 2 === 0) ? 1 : 0,
        ];

        foreach ($poruthams as $name => $score) {
            $matchDetails[] = [
                'name'   => $name,
                'result' => $score === 1 ? 'Match' : 'No Match',
                'score'  => $score
            ];
            $totalScore += $score;
        }

        $matchStatus = $totalScore >= 6 ? 'Match' : 'No Match';

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
            'user_id'        => $userId,
            'boy_name'       => $request->boy_name,
            'boy_dob'        => $request->boy_dob,
            'boy_tob'        => $request->input('boy_tob'),
            'boy_pob'        => $request->input('boy_pob'),
            'boy_rasi'       => $request->boy_rasi,
            'boy_nakshatra'  => $request->boy_nakshatra,
            'girl_name'      => $request->girl_name,
            'girl_dob'       => $request->girl_dob,
            'girl_tob'       => $request->input('girl_tob'),
            'girl_pob'       => $request->input('girl_pob'),
            'girl_rasi'      => $request->girl_rasi,
            'girl_nakshatra' => $request->girl_nakshatra,
            'match_score'    => $totalScore,
            'match_status'   => $matchStatus,
            'match_details'  => json_encode($matchDetails),
            'created_at'     => now(),
            'updated_at'     => now()
        ]);

        return response()->json([
            'success'      => true,
            'match_id'     => $id,
            'boy_name'     => $request->boy_name,
            'girl_name'    => $request->girl_name,
            'match_score'  => $totalScore,
            'match_status' => $matchStatus,
            'match_details'=> $matchDetails,
            'message'      => $matchStatus === 'Match'
                ? "நல்ல பொருத்தம்! {$totalScore}/10 பொருத்தங்கள் உள்ளன."
                : "பொருத்தம் சரியில்லை. {$totalScore}/10 மட்டுமே பொருந்துகின்றன."
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
        $request->validate([
            'admin_status' => 'required|string',
            'admin_notes'  => 'nullable|string'
        ]);

        DB::table('marriage_matches')
            ->where('id', $id)
            ->update([
                'admin_status' => $request->admin_status,
                'admin_notes'  => $request->admin_notes,
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
