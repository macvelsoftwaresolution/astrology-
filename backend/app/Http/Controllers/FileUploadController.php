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
        @ini_set('upload_max_filesize', '128M');
        @ini_set('post_max_size', '128M');
        @ini_set('memory_limit', '512M');
        @ini_set('max_execution_time', '300');

        $file = $request->file('file');
        if (!$file) {
            return response()->json(['message' => 'No file uploaded.'], 400);
        }

        $mime = strtolower($file->getMimeType() ?: '');
        $ext = strtolower($file->getClientOriginalExtension() ?: '');

        // Dynamic file size limits according to requirements:
        // Audio: Max 100MB (102400 KB) - Supports up to 30+ minutes high quality audio
        // Video: Max 50MB (51200 KB)
        // PDF: Max 25MB (25600 KB)
        // Others: Max 25MB (25600 KB)
        $maxKb = 25600;
        if (str_starts_with($mime, 'audio/') || in_array($ext, ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'weba', 'opus'])) {
            $maxKb = 102400; // 100 MB for Audio (supports up to 30+ minutes)
        } elseif (str_starts_with($mime, 'video/') || in_array($ext, ['mp4', 'mkv', 'avi', 'mov', 'webm'])) {
            $maxKb = 51200; // 50 MB for Video
        } elseif ($mime === 'application/pdf' || $ext === 'pdf') {
            $maxKb = 25600; // 25 MB for PDF
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
                $fileHandle = fopen($file->getRealPath(), 'r');
                $response = Http::withoutVerifying()->timeout(300)->attach(
                    'file', $fileHandle, $file->getClientOriginalName()
                )->post("https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload", [
                    'api_key'   => $apiKey,
                    'timestamp' => $timestamp,
                    'folder'    => $targetFolder,
                    'public_id' => $safeName,
                    'signature' => $signature,
                ]);
                if (is_resource($fileHandle)) {
                    fclose($fileHandle);
                }

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
