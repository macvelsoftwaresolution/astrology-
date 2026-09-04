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
        @ini_set('upload_max_filesize', '40M');
        @ini_set('post_max_size', '40M');
        @ini_set('memory_limit', '256M');

        $file = $request->file('file');
        if (!$file) {
            return response()->json(['message' => 'No file uploaded.'], 400);
        }

        $mime = strtolower($file->getMimeType() ?: '');
        $ext = strtolower($file->getClientOriginalExtension() ?: '');

        // Dynamic file size limits according to requirements:
        // Audio: Max 10MB (10240 KB)
        // Video: Max 25MB (25600 KB)
        // PDF: Max 15MB (15360 KB)
        // Others: Max 10MB (10240 KB)
        $maxKb = 10240; // Default 10MB
        if (str_starts_with($mime, 'audio/') || in_array($ext, ['mp3', 'wav', 'm4a', 'aac', 'ogg'])) {
            $maxKb = 10240; // 10 MB for Audio
        } elseif (str_starts_with($mime, 'video/') || in_array($ext, ['mp4', 'mkv', 'avi', 'mov', 'webm'])) {
            $maxKb = 25600; // 25 MB for Video
        } elseif ($mime === 'application/pdf' || $ext === 'pdf') {
            $maxKb = 15360; // 15 MB for PDF
        }

        $request->validate([
            'file' => "required|file|max:{$maxKb}",
            'folder' => 'nullable|string'
        ]);

        $folder = $request->input('folder', 'uploads');
        $folder = preg_replace('/[^a-zA-Z0-9_\-]/', '', $folder) ?: 'uploads';

        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = Str::slug($originalName) . '-' . time();

        // 1. Try Direct Cloudinary REST API (Bypasses cURL local SSL bundle issues on Windows)
        $cloudinaryUrl = env('CLOUDINARY_URL') ?: config('cloudinary.cloud_url');
        if ($cloudinaryUrl && preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', trim($cloudinaryUrl, '"\''), $matches)) {
            $apiKey    = $matches[1];
            $apiSecret = $matches[2];
            $cloudName = $matches[3];

            $timestamp = time();
            $targetFolder = "astrology/{$folder}";
            
            // Determine correct resource type for Cloudinary
            $mime = strtolower($file->getMimeType());
            $resourceType = 'auto';
            if (str_starts_with($mime, 'audio/') || str_starts_with($mime, 'video/')) {
                $resourceType = 'video';
            } elseif (str_starts_with($mime, 'image/')) {
                $resourceType = 'image';
            } else {
                $resourceType = 'raw'; // Fallback for PDFs, documents, etc.
            }

            $paramsToSign = "folder={$targetFolder}&public_id={$safeName}&timestamp={$timestamp}";
            $signature = sha1($paramsToSign . $apiSecret);

            try {
                $response = Http::withoutVerifying()->timeout(90)->attach(
                    'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
                )->post("https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload", [
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
                } else {
                    Log::warning('Cloudinary REST API response error: ' . $response->body());
                }
            } catch (\Throwable $e) {
                Log::warning('Cloudinary REST API attempt: ' . $e->getMessage());
            }
        }

        // 2. Try Official Cloudinary Laravel Facade
        if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class)) {
            try {
                $uploaded = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload($file->getRealPath(), [
                    'folder' => "astrology/{$folder}",
                    'public_id' => $safeName,
                    'resource_type' => $resourceType
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
