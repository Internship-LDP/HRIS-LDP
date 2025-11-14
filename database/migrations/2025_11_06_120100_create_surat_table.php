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
        Schema::create('surat', function (Blueprint $table) {
            $table->id('surat_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('departemen_id')->nullable()->constrained('departemen')->nullOnDelete();
            $table->string('nomor_surat')->unique();
            $table->string('tipe_surat')->default('keluar');
            $table->string('jenis_surat');
            $table->date('tanggal_surat');
            $table->string('perihal');
            $table->text('isi_surat');
            $table->string('status_persetujuan')->default('Terkirim');
            $table->date('tanggal_persetujuan')->nullable();
            $table->string('kategori')->default('Internal');
            $table->string('prioritas')->default('medium');
            $table->string('penerima');
            $table->string('target_division')->nullable();
            $table->string('previous_division')->nullable();
            $table->enum('current_recipient', ['hr', 'division', 'archive'])->default('hr');
            $table->foreignId('disposed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disposed_at')->nullable();
            $table->text('disposition_note')->nullable();
            $table->text('reply_note')->nullable();
            $table->foreignId('reply_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reply_at')->nullable();
            $table->text('alamat_pengirim')->nullable();
            $table->string('lampiran_path')->nullable();
            $table->string('lampiran_nama')->nullable();
            $table->string('lampiran_mime')->nullable();
            $table->unsignedBigInteger('lampiran_size')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat');
    }
};
