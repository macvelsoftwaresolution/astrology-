<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User (Web Portal Login - admin@gmail.com / admin123)
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'phone'    => '9876543211',
                'status'   => 'active',
            ]
        );

        // 2. Demo Normal User (Mobile App Login - user@gmail.com / user123)
        User::updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name'     => 'Demo User',
                'password' => Hash::make('test123'),
                'role'     => 'user',
                'phone'    => '9876543200',
                'status'   => 'active',
            ]
        );

        // 3. Demo LMS Student (Mobile App Login - student_id: 26AR01 / DEMO01)
        //    Saved in both 'students' table and 'users' table
        Student::updateOrCreate(
            ['student_id' => '26AR01'],
            [
                'name'    => 'Demo Student',
                'email'   => 'student@gmail.com',
                'phone'   => '9876543299',
                'password'=> Hash::make('TEST123'),
                'status'  => 'active',
                'address' => '12 Gandhi Street, T. Nagar, Chennai - 600017',
            ]
        );

        User::updateOrCreate(
            ['student_id' => '26AR01'],
            [
                'name'       => 'Demo Student',
                'email'      => 'student@gmail.com',
                'phone'      => '9876543299',
                'password'   => Hash::make('DEMO01'),
                'role'       => 'user',
                'status'     => 'active',
                'address'    => '12 Gandhi Street, T. Nagar, Chennai - 600017',
            ]
        );
    }
}
