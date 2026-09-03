<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$req = Illuminate\Http\Request::create('/api/student/curriculum', 'GET');
$req->setUserResolver(function() { return App\Models\User::where('email', 'arjunejansi123@gmail.com')->first(); });
$controller = $app->make(App\Http\Controllers\LmsCurriculumController::class);
$res = $controller->getStudentCurriculum($req);
echo json_encode($res->getData(), JSON_PRETTY_PRINT);
