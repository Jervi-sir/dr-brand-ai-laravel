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
        // Chats table
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->nullOnDelete();
            $table->text('title')->nullable();
            $table->enum('visibility', ['public', 'private'])->default('private');
            $table->text('capability')->nullable();
            $table->string('threadId', 64)->nullable();

            $table->softDeletes();
            $table->timestamps();
        });

        // AIModels table
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->string('name', 64);
            $table->string('endpoint', 256)->nullable();
            $table->string('api_key', 128)->nullable();
            $table->text('capability')->nullable();
            $table->string('provider', 64)->default('openai');
            $table->string('display_name', 64)->nullable();
            $table->string('type', 64)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_tokens')->nullable();
            $table->integer('temperature')->nullable();
            $table->text('custom_prompts')->nullable();
            $table->decimal('input_price', 10, 4)->nullable();
            $table->decimal('output_price', 10, 4)->nullable();
            $table->decimal('cached_input_price', 10, 4)->nullable();
            $table->timestamps();
        });

        // Messages table
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->nullOnDelete();
            $table->string('role');
            $table->json('content');
            $table->json('annotations')->nullable()->default(null);
            $table->foreignId('model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->integer('prompt_tokens')->nullable();
            $table->integer('completion_tokens')->nullable();
            $table->integer('total_tokens')->nullable();
            $table->decimal('duration', 10, 4)->nullable();
            $table->timestamps();
        });

        // Votes table (pivot)
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->nullOnDelete();
            $table->foreignId('message_id')->constrained()->nullOnDelete();
            $table->boolean('is_upvoted');
            $table->timestamps();
        });

        // Documents table
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->text('content')->nullable();
            $table->enum('kind', ['text', 'code', 'image', 'sheet'])->default('text');
            $table->foreignId('user_id')->constrained()->nullOnDelete();

            $table->timestamps();
        });

        // SubscriptionModels table (pivot)
        Schema::create('subscription_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_plan_id')->constrained()->nullOnDelete();
            $table->foreignId('ai_model_id')->constrained()->nullOnDelete();

            $table->timestamps();
        });

        // Suggestions table
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->nullOnDelete();
            $table->timestamp('document_created_at');
            $table->text('original_text');
            $table->text('suggested_text');
            $table->text('description')->nullable();
            $table->boolean('is_resolved')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::dropIfExists('split_prompt_history');
    }
};
