<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 100)->nullable();
            $table->string('mobile', 20)->unique();
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->string('role', 50)->default('Sales');
            $table->decimal('monthly_salary', 12, 2)->default(0);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->unique();
            $table->string('location', 255)->nullable();
            $table->enum('status', ['Active', 'Completed'])->default('Active');
            $table->timestamps();
        });

        Schema::create('incentive_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->enum('rule_type', ['Percentage', 'Fixed']);
            $table->decimal('value', 10, 2);
            $table->enum('release_trigger', ['Booking', 'Bana Khat', 'Sale Deed', 'Collection']);
            $table->text('condition_logic')->nullable();
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('restrict');
            $table->string('customer_name', 120);
            $table->string('customer_mobile', 20)->nullable();
            $table->string('unit_number', 50);
            $table->decimal('basic_amount', 15, 2);
            $table->decimal('extra_charges', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->date('booking_date');
            $table->enum('status', ['Booking Done', 'Bana Khat Done', 'Sale Deed Done', 'Completed', 'Cancelled'])->default('Booking Done');
            $table->date('bana_khat_date')->nullable();
            $table->date('sale_deed_date')->nullable();
            $table->timestamps();
        });

        Schema::create('booking_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('collection_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('restrict');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_mode', ['Cheque', 'NEFT_RTGS', 'Cash', 'UPI'])->default('NEFT_RTGS');
            $table->date('payment_date');
            $table->string('reference_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('employee_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('restrict');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            $table->enum('entry_type', ['SALARY_CREDIT', 'INCENTIVE_CREDIT', 'VISIT_BONUS_CREDIT', 'ADVANCE_DEBIT', 'PAYMENT_DEBIT']);
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['Future', 'Eligible', 'Paid', 'Active', 'Settled'])->default('Eligible');
            $table->date('transaction_date');
            $table->string('description', 255);
            $table->boolean('is_manual')->default(false);
            $table->timestamps();
        });

        Schema::create('site_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('restrict');
            $table->foreignId('project_id')->constrained('projects')->onDelete('restrict');
            $table->integer('visit_count')->default(1);
            $table->date('visit_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('expense_ledger', function (Blueprint $table) {
            $table->id();
            $table->string('category', 100);
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->string('paid_to', 120)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_ledger');
        Schema::dropIfExists('site_visits');
        Schema::dropIfExists('employee_ledger');
        Schema::dropIfExists('collection_ledger');
        Schema::dropIfExists('booking_assignments');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('incentive_rules');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('employees');
    }
};
