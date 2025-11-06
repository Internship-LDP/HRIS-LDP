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
            $table->string('target_division')->nullable()->after('penerima');
            $table->enum('current_recipient', ['hr', 'division'])->default('hr')->after('target_division');
            $table->foreignId('disposed_by')->nullable()->after('current_recipient')->constrained('users')->nullOnDelete();
            $table->timestamp('disposed_at')->nullable()->after('disposed_by');
            $table->text('disposition_note')->nullable()->after('disposed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat', function (Blueprint $table) {
            $table->dropForeign(['disposed_by']);
            $table->dropColumn([
                'target_division',
                'current_recipient',
                'disposed_by',
                'disposed_at',
                'disposition_note',
            ]);
        });
    }
};
