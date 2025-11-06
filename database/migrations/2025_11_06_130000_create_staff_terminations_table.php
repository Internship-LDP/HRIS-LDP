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
        Schema::create('staff_terminations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_code')->nullable()->index();
            $table->string('employee_name');
            $table->string('division')->nullable();
            $table->string('position')->nullable();
            $table->enum('type', ['Resign', 'PHK', 'Pensiun'])->default('Resign');
            $table->text('reason')->nullable();
            $table->text('suggestion')->nullable();
            $table->date('request_date')->nullable();
            $table->date('effective_date')->nullable();
            $table->string('status')->default('Diajukan');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->json('checklist')->nullable();
            $table->timestamp('exit_interview_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_terminations');
    }
};
