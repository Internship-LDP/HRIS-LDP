<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Hapus kolom typo jika pernah terbuat
        if (Schema::hasColumn('applications', 'rejectetion_reason')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->dropColumn('rejectetion_reason');
            });
        }

        Schema::table('applications', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });
    }
};
