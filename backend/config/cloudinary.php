<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | An HTTP or HTTPS URL pointing to the Cloudinary API.
    | Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    |
    */
    'cloud_url' => env('CLOUDINARY_URL'),

    /**
     * Upload Preset From Cloudinary Dashboard
     */
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

    /**
     * The upload route path
     */
    'upload_route' => env('CLOUDINARY_UPLOAD_ROUTE', 'api/upload'),

    /**
     * The controller to handle upload requests
     */
    'upload_action' => env('CLOUDINARY_UPLOAD_ACTION'),

    /**
     * Cloudinary credentials for SDK
     */
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),

];
