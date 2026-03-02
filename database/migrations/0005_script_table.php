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
    // Content table
    Schema::create('contents', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->nullOnDelete();

      $table->string('title', 255);
      $table->text('user_prompt');
      $table->text('topic_prompt')->nullable();
      $table->string('content_idea')->nullable();
      $table->string('hook_type')->nullable();
      $table->string('mood');
      $table->text('generated_script');
      $table->string('stage', 50)->default('script');
      $table->timestamp('scheduled_date')->nullable();
      $table->timestamp('deadline')->nullable();
      $table->timestamps();
    });
    // ScriptHistory table
    Schema::create('script_history', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->nullOnDelete();
      $table->foreignId('content_id')->constrained()->nullOnDelete();
      $table->text('user_prompt');
      $table->text('topic_prompt')->nullable();
      $table->string('content_idea', 255);
      $table->string('hook_type', 255);
      $table->jsonb('generated_scripts');
      $table->string('used_model_id', 255)->nullable();
      $table->jsonb('token_usage')->nullable();
      $table->timestamps();
    });

    // GeneratedSplitHistory table
    Schema::create('generated_split_history', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->nullOnDelete();
      $table->text('prompt');
      $table->text('client_persona');
      $table->text('content_pillar');
      $table->jsonb('sub_pillars')->default('[]');
      $table->jsonb('chosen_sub_pillars')->default('[]');
      $table->jsonb('hook_type')->default('[]');
      $table->jsonb('scripts')->default('[]');
      $table->boolean('is_deleted')->default(false);
      $table->timestamps();
    });

    // SplitPromptHistory table
    Schema::create('split_prompt_history', function (Blueprint $table) {
      $table->id();
      $table->foreignId('model_id')->constrained('ai_models')->nullOnDelete();
      $table->string('model_code_name', 128)->nullable();
      $table->text('prompt');
      $table->string('user_email', 128)->nullable();
      $table->boolean('is_current')->default(false);
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
