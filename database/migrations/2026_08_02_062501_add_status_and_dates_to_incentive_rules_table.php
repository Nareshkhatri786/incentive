<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('incentive_rules', function (Blueprint $table) {
            $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('condition_logic');
            $table->date('effective_from')->nullable()->after('status');
            $table->date('effective_to')->nullable()->after('effective_from');
        });
    }

    public function down(): void
    {
        Schema::table('incentive_rules', function (Blueprint $table) {
            $table->dropColumn(['status', 'effective_from', 'effective_to']);
        });
    }
};
