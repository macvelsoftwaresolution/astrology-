<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Admin User & Student User
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '9876543211',
                'status' => 'active'
            ]
        );

        $student = User::updateOrCreate(
            ['phone' => '9876543210'],
            [
                'name' => 'Demo User',
                'email' => 'user@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'user',
                'status' => 'active',
                'address' => '12 Gandhi Street, T. Nagar, Chennai - 600017'
            ]
        );

        User::updateOrCreate(
            ['email' => 'karthik@gmail.com'],
            [
                'name' => 'Karthik S',
                'password' => Hash::make('test123'),
                'role' => 'user',
                'phone' => '9876543212',
                'status' => 'active',
                'address' => '12 Gandhi Street, T. Nagar, Chennai - 600017'
            ]
        );

        // Remove any old superadmin user if existing
        User::where('email', 'superadmin@gmail.com')->delete();

        // Demo data commented out per user request.

    }
}
