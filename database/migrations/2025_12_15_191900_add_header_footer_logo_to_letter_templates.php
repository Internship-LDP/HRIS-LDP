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
        Schema::table('letter_templates', function (Blueprint $table) {
            $table->text('header_text')->nullable()->after('file_name');
            $table->text('footer_text')->nullable()->after('header_text');
            $table->string('logo_path')->nullable()->after('footer_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_templates', function (Blueprint $table) {
            $table->dropColumn(['header_text', 'footer_text', 'logo_path']);
        });
    }
};
