<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Upload single file (image, audio, video, pdf, document) directly to Cloudinary with fallback
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // max 100MB
            'folder' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $folder = $request->input('folder', 'uploads');
        $folder = preg_replace('/[^a-zA-Z0-9_\-]/', '', $folder) ?: 'uploads';

        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = Str::slug($originalName) . '-' . time();

        // 1. Try Official Cloudinary Laravel Facade
        if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class)) {
            try {
                $uploaded = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload($file->getRealPath(), [
                    'folder' => "astrology/{$folder}",
                    'public_id' => $safeName,
                    'resource_type' => 'auto'
                ]);

                if ($uploaded && method_exists($uploaded, 'getSecurePath') && $uploaded->getSecurePath()) {
                    return response()->json([
                        'success'   => true,
                        'url'       => $uploaded->getSecurePath(),
                        'path'      => $uploaded->getPublicId(),
                        'file_name' => $file->getClientOriginalName(),
                        'size'      => $file->getSize(),
                        'mime_type' => $file->getMimeType()
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Cloudinary SDK upload attempt: ' . $e->getMessage());
            }
        }

        // 2. Try Direct Cloudinary REST API
        $cloudinaryUrl = env('CLOUDINARY_URL') ?: config('cloudinary.cloud_url');
        if ($cloudinaryUrl && preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', trim($cloudinaryUrl, '"\''), $matches)) {
            $apiKey    = $matches[1];
            $apiSecret = $matches[2];
            $cloudName = $matches[3];

            $timestamp = time();
            $targetFolder = "astrology/{$folder}";
            $paramsToSign = "folder={$targetFolder}&public_id={$safeName}&timestamp={$timestamp}";
            $signature = sha1($paramsToSign . $apiSecret);

            try {
                $response = Http::timeout(60)->attach(
                    'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
                )->post("https://api.cloudinary.com/v1_1/{$cloudName}/auto/upload", [
                    'api_key'   => $apiKey,
                    'timestamp' => $timestamp,
                    'folder'    => $targetFolder,
                    'public_id' => $safeName,
                    'signature' => $signature,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return response()->json([
                        'success'   => true,
                        'url'       => $data['secure_url'] ?? $data['url'],
                        'path'      => $data['public_id'] ?? $safeName,
                        'file_name' => $file->getClientOriginalName(),
                        'size'      => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'format'    => $data['format'] ?? $extension
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Cloudinary REST API attempt: ' . $e->getMessage());
            }
        }

        // 3. Fallback to local storage
        try {
            $localPath = $file->store("uploads/{$folder}", 'public');
            return response()->json([
                'success'   => true,
                'url'       => url('storage/' . $localPath),
                'path'      => $localPath,
                'file_name' => $file->getClientOriginalName(),
                'size'      => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
