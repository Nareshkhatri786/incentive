<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            ['name' => 'Keval Pandya', 'role' => 'Manager', 'mobile' => '1234567890', 'username' => 'keval', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Megha Trivedi', 'role' => 'Sales', 'mobile' => '1234567891', 'username' => 'megha', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Bhargav', 'role' => 'Sales', 'mobile' => '1234567892', 'username' => 'bhargav', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Vimal Shah', 'role' => 'Sales', 'mobile' => '1234567893', 'username' => 'vimal', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Hemant Prajapati', 'role' => 'Sales', 'mobile' => '1234567894', 'username' => 'hemant', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Priyank Patel', 'role' => 'Sales', 'mobile' => '1234567895', 'username' => 'priyank', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Vani Panchal', 'role' => 'Sales', 'mobile' => '1234567896', 'username' => 'vani', 'password' => 'password123', 'is_admin' => false],
            ['name' => 'Admin User', 'role' => 'Admin', 'mobile' => '0000000000', 'username' => 'admin', 'password' => 'admin123', 'is_admin' => true],
        ];

        foreach ($employees as $emp) {
            Employee::updateOrCreate(
                ['username' => $emp['username']],
                [
                    'name' => $emp['name'],
                    'role' => $emp['role'],
                    'mobile' => $emp['mobile'],
                    'password' => Hash::make($emp['password']),
                    'status' => 'Active',
                    'is_admin' => $emp['is_admin'],
                ]
            );
        }
    }
}
