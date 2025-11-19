<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->date('interview_date')->nullable();
            $table->time('interview_time')->nullable();
            $table->string('interview_mode')->nullable();
            $table->string('interviewer_name')->nullable();
            $table->string('meeting_link')->nullable();
            $table->text('interview_notes')->nullable();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            //
        });
    }
};
