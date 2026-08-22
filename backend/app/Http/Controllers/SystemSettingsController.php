<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SystemSettingsController extends Controller
{
    public function getRasiIcons()
    {
        $setting = SystemSetting::where('key', 'rasi_icons')->first();
        
        if ($setting && $setting->value) {
            return response()->json(json_decode($setting->value, true));
        }
        
        return response()->json((object)[]); // Return empty object if none
    }

    public function saveRasiIcons(Request $request)
    {
        $payload = $request->all();
        
        $setting = SystemSetting::updateOrCreate(
            ['key' => 'rasi_icons'],
            ['value' => json_encode($payload)]
        );

        return response()->json([
            'message' => 'Rasi icons updated successfully',
            'data' => json_decode($setting->value, true)
        ]);
    }
    public function getSetting(Request $request, $key)
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if ($setting) {
            return response()->json([
                'success' => true,
                'key' => $key,
                'value' => $setting->value
            ]);
        }
        
        return response()->json([
            'success' => true,
            'key' => $key,
            'value' => null
        ]);
    }

    public function saveSetting(Request $request, $key)
    {
        $request->validate([
            'value' => 'nullable|string'
        ]);

        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $request->value]
        );

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'key' => $key,
            'value' => $setting->value
        ]);
    }
}
