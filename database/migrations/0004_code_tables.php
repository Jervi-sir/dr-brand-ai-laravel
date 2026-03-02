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
        // Codes table
        Schema::create('codes', function (Blueprint $table) {
            $table->id();
            $table->text('code')->unique();
            $table->integer('max_uses')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // CodeUsage table
        Schema::create('code_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->nullOnDelete();
            $table->foreignId('code_id')->constrained()->nullOnDelete();

            $table->timestamp('used_at')->useCurrent();
            $table->boolean('is_success');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
