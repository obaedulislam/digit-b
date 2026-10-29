<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Named `job_postings` because the Laravel queue already owns the `jobs` table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('reference_code', 40)->nullable()->unique();
            $table->string('employment_type', 20);
            $table->string('work_mode', 10);
            $table->string('location', 120);
            $table->string('country', 80)->nullable();
            $table->string('department', 80)->nullable();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('salary_currency', 3)->default('USD');
            $table->string('salary_period', 10)->default('year');
            $table->boolean('show_salary')->default(true);
            $table->unsignedTinyInteger('experience_min')->nullable();
            $table->unsignedTinyInteger('experience_max')->nullable();
            $table->string('status', 10)->default('draft');
            $table->timestamp('closes_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->text('summary');
            $table->longText('description_markdown');
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->json('nice_to_have')->nullable();
            $table->json('benefits')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index('employment_type');
            $table->index('work_mode');
            $table->index('location');
            $table->index('department');
            $table->index('closes_at');
            $table->index('is_featured');
            $table->index('salary_max');
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
