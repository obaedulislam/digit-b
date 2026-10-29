<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email')->unique(); // stored lower-cased
            $table->string('phone', 20);
            $table->string('location', 120);
            $table->string('linkedin_url')->nullable();
            $table->string('current_title', 120);
            $table->string('current_company')->nullable();
            $table->unsignedTinyInteger('years_experience');
            $table->string('highest_education', 20);
            $table->json('skills')->nullable();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
