<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PDO;

class LegacyDataSeeder extends Seeder
{
    public function run(): void
    {
        $oldDb = new PDO("mysql:host=127.0.0.1;dbname=collection_system;charset=utf8mb4", 'root', '');
        $oldDb->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        // 1. Employees
        $oldEmployees = $oldDb->query("SELECT * FROM employees")->fetchAll();
        foreach ($oldEmployees as $emp) {
            DB::table('employees')->updateOrInsert(
                ['id' => $emp['id']],
                [
                    'name' => $emp['name'],
                    'mobile' => $emp['mobile'] ?? '0000000000',
                    'username' => $emp['username'],
                    'password' => Hash::make($emp['password'] ?? 'password123'),
                    'role' => $emp['role'] ?? 'Sales',
                    'monthly_salary' => $emp['monthly_salary'] ?? 0,
                    'status' => $emp['status'] ?? 'Active',
                    'is_admin' => $emp['is_admin'] ?? 0,
                    'created_at' => $emp['created_at'] ?? now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 2. Projects
        $oldProjects = $oldDb->query("SELECT * FROM projects")->fetchAll();
        foreach ($oldProjects as $proj) {
            DB::table('projects')->updateOrInsert(
                ['id' => $proj['id']],
                [
                    'name' => $proj['name'],
                    'status' => 'Active',
                    'created_at' => $proj['created_at'] ?? now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Incentive Rules
        $oldRules = $oldDb->query("SELECT * FROM incentive_rules")->fetchAll();
        foreach ($oldRules as $rule) {
            DB::table('incentive_rules')->updateOrInsert(
                ['id' => $rule['id']],
                [
                    'project_id' => $rule['project_id'],
                    'employee_id' => $rule['employee_id'],
                    'rule_type' => $rule['rule_type'],
                    'value' => $rule['value'],
                    'release_trigger' => $rule['release_trigger'],
                    'condition_logic' => $rule['condition_logic'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 4. Bookings
        $oldBookings = $oldDb->query("SELECT * FROM bookings")->fetchAll();
        foreach ($oldBookings as $b) {
            DB::table('bookings')->updateOrInsert(
                ['id' => $b['id']],
                [
                    'project_id' => $b['project_id'],
                    'customer_name' => $b['client_name'],
                    'unit_number' => $b['unit_number'],
                    'basic_amount' => $b['basic_amount'],
                    'booking_date' => $b['booking_date'] ?? now()->toDateString(),
                    'status' => $b['status'] ?? 'Booking Done',
                    'bana_khat_date' => $b['agreement_date'] ?? null,
                    'sale_deed_date' => $b['sale_deed_date'] ?? null,
                    'created_at' => $b['created_at'] ?? now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 5. Booking Assignments
        $oldAssignments = $oldDb->query("SELECT * FROM booking_assignments")->fetchAll();
        foreach ($oldAssignments as $asgn) {
            DB::table('booking_assignments')->updateOrInsert(
                ['id' => $asgn['id']],
                [
                    'booking_id' => $asgn['booking_id'],
                    'employee_id' => $asgn['employee_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 6. Collection Ledger
        $oldCollections = $oldDb->query("SELECT * FROM collections")->fetchAll();
        foreach ($oldCollections as $c) {
            DB::table('collection_ledger')->updateOrInsert(
                ['id' => $c['id']],
                [
                    'booking_id' => $c['booking_id'],
                    'amount' => $c['amount'],
                    'payment_mode' => 'NEFT_RTGS',
                    'payment_date' => $c['payment_date'],
                    'notes' => $c['notes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 7. Incentives & On Account (into employee_ledger)
        $oldIncentives = $oldDb->query("SELECT * FROM incentives")->fetchAll();
        foreach ($oldIncentives as $inc) {
            DB::table('employee_ledger')->updateOrInsert(
                ['id' => $inc['id']],
                [
                    'employee_id' => $inc['employee_id'],
                    'booking_id' => $inc['booking_id'],
                    'entry_type' => 'INCENTIVE_CREDIT',
                    'amount' => $inc['amount'],
                    'status' => $inc['status'] ?? 'Eligible',
                    'transaction_date' => $inc['release_date'] ?? now()->toDateString(),
                    'description' => $inc['rule_description'] ?? 'Incentive',
                    'is_manual' => $inc['is_manual'] ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $oldOnAccount = $oldDb->query("SELECT * FROM on_account_advances")->fetchAll();
        foreach ($oldOnAccount as $adv) {
            DB::table('employee_ledger')->insert([
                'employee_id' => $adv['employee_id'],
                'booking_id' => null,
                'entry_type' => 'ADVANCE_DEBIT',
                'amount' => $adv['amount'],
                'status' => $adv['status'] ?? 'Active',
                'transaction_date' => $adv['advance_date'],
                'description' => 'On Account Advance',
                'is_manual' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 8. Site Visits
        $oldVisits = $oldDb->query("SELECT * FROM visits")->fetchAll();
        foreach ($oldVisits as $v) {
            DB::table('site_visits')->insert([
                'employee_id' => $v['employee_id'],
                'project_id' => $v['project_id'] ?? 1,
                'visit_count' => $v['visit_count'] ?? 1,
                'visit_date' => $v['visit_date'] ?? now()->toDateString(),
                'notes' => $v['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
