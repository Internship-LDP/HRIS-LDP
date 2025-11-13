<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE surat MODIFY current_recipient ENUM('hr','division','archive') NOT NULL DEFAULT 'hr'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE surat MODIFY current_recipient ENUM('hr','division') NOT NULL DEFAULT 'hr'");
    }
};
