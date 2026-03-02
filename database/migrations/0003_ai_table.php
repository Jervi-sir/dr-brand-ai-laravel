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
        // OpenAiApiUsage table
        Schema::create('openai_api_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->nullOnDelete();
            $table->foreignId('model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->string('type', 64);
            $table->integer('prompt_tokens');
            $table->integer('completion_tokens');
            $table->integer('total_tokens');
            $table->decimal('duration', 10, 4)->nullable();

            $table->timestamps();
        });

        // PromptHistory table
        Schema::create('prompt_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('ai_models')->nullOnDelete();
            $table->text('prompt');
            $table->string('userEmail', 128)->nullable();
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
