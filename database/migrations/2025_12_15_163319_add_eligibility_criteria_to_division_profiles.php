<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('division_profiles', function (Blueprint $table) {
            $table->json('job_eligibility_criteria')->nullable()->after('job_requirements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('division_profiles', function (Blueprint $table) {
            $table->dropColumn('job_eligibility_criteria');
        });
    }
};
