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
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_code')->nullable()->unique()->after('id');
            $table->string('role')->default('Staff')->after('email');
            $table->string('division')->nullable()->after('role');
            $table->string('status')->default('Active')->after('division');
            $table->date('registered_at')->nullable()->after('status');
            $table->timestamp('last_login_at')->nullable()->after('registered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employee_code',
                'role',
                'division',
                'status',
                'registered_at',
                'last_login_at',
            ]);
        });
    }
};
