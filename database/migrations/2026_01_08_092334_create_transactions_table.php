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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('pricing_package_id')->nullable()->constrained()->onDelete('set null');

            // Transaction Details
            $table->string('invoice_number')->unique();
            $table->string('reference')->unique()->nullable(); // Duitku reference
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->string('payment_code')->nullable(); // Kode bayar dari Duitku

            // Duitku Response Data
            $table->string('merchant_order_id')->unique();
            $table->text('payment_url')->nullable(); // URL redirect ke Duitku
            $table->string('va_number')->nullable(); // Virtual Account number jika ada
            $table->string('qr_string')->nullable(); // QR code string jika ada

            // Status & Timestamps
            $table->enum('status', ['pending', 'paid', 'failed', 'expired', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();

            // Additional Info
            $table->text('customer_info')->nullable(); // JSON untuk info customer
            $table->text('callback_response')->nullable(); // JSON response dari callback
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('invoice_number');
            $table->index('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
