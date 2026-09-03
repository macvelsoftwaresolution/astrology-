<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$req = Illuminate\Http\Request::create('/api/student/curriculum', 'GET');
$req->setUserResolver(function() { return App\Models\User::where('email', 'arjunejansi123@gmail.com')->first(); });
$res = app()->handle($req);
echo $res->getContent();
