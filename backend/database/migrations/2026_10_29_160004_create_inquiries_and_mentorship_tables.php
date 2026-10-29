<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('company')->nullable();
            $table->string('inquiry_type', 20);
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('status', 10)->default('new');
            $table->text('notes')->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('inquiry_type');
            $table->index('email');
            $table->index('created_at');
        });

        Schema::create('mentorship_programs', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tier', 10);
            $table->string('audience', 20)->default('individuals'); // individuals | employers
            $table->text('summary');
            $table->decimal('price_amount', 10, 2)->nullable();
            $table->string('price_currency', 3)->default('USD');
            $table->string('price_unit_label', 60)->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('cta_label', 60)->default('Get Started');
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'sort_order']);
            $table->index('tier');
        });

        Schema::create('mentorship_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentorship_program_id')->constrained('mentorship_programs')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('current_role', 120)->nullable();
            $table->text('goal');
            $table->string('status', 10)->default('new');
            $table->text('notes')->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentorship_requests');
        Schema::dropIfExists('mentorship_programs');
        Schema::dropIfExists('contact_inquiries');
    }
};
