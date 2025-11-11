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
        Schema::table('surat', function (Blueprint $table) {
            $table->text('reply_note')->nullable()->after('disposition_note');
            $table->foreignId('reply_by')->nullable()->after('reply_note')->constrained('users')->nullOnDelete();
            $table->timestamp('reply_at')->nullable()->after('reply_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat', function (Blueprint $table) {
            $table->dropForeign(['reply_by']);
            $table->dropColumn(['reply_note', 'reply_by', 'reply_at']);
        });
    }
};
