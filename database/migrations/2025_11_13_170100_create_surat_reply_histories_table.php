<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surat_reply_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_id')
                ->constrained('surat', 'surat_id')
                ->cascadeOnDelete();
            $table->foreignId('replied_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('from_division')->nullable();
            $table->string('to_division')->nullable();
            $table->text('note');
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });

        DB::table('surat')
            ->whereNotNull('reply_note')
            ->orderBy('surat_id')
            ->chunkById(100, function ($letters) {
                $records = [];
                $now = now();
                foreach ($letters as $surat) {
                    $records[] = [
                        'surat_id' => $surat->surat_id,
                        'replied_by' => $surat->reply_by,
                        'from_division' => $surat->previous_division,
                        'to_division' => $surat->target_division,
                        'note' => $surat->reply_note,
                        'replied_at' => $surat->reply_at,
                        'created_at' => $surat->reply_at ?? $now,
                        'updated_at' => $surat->reply_at ?? $now,
                    ];
                }

                if (! empty($records)) {
                    DB::table('surat_reply_histories')->insert($records);
                }
            }, 'surat_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_reply_histories');
    }
};
