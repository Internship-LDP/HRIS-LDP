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
        Schema::create('division_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('manager_name')->nullable();
            $table->unsignedInteger('capacity')->default(0);
            $table->boolean('is_hiring')->default(false);
            $table->string('job_title')->nullable();
            $table->text('job_description')->nullable();
            $table->json('job_requirements')->nullable();
            $table->timestamp('hiring_opened_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('division_profiles');
    }
};
