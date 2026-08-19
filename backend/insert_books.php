<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
DB::table('books')->insert([
    ['title'=>'Complete Tamil Jathagam & Panchangam Reference Book (Hardcover)', 'author'=>'Astro Team', 'price'=>1500, 'description'=>'Reference Book', 'created_at'=>now(), 'updated_at'=>now()],
    ['title'=>'Astrology for Beginners', 'author'=>'Astro Team', 'price'=>500, 'description'=>'Beginners Guide', 'created_at'=>now(), 'updated_at'=>now()]
]);
echo "Books inserted\n";
