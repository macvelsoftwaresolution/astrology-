<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Upload single file (image, audio, video, pdf, document)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // max 100MB
            'folder' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $folder = $request->input('folder', 'uploads');
        $folder = preg_replace('/[^a-zA-Z0-9_\-]/', '', $folder); // sanitize folder name

        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = Str::slug($originalName) . '-' . time();

        try {
            $cloudinaryResponse = cloudinary()->upload($file->getRealPath(), [
                'folder' => "astrology/{$folder}",
                'public_id' => $safeName,
                'resource_type' => 'auto'
            ]);

            $url = $cloudinaryResponse->getSecurePath();
            $path = $cloudinaryResponse->getPublicId();

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cloudinary upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
