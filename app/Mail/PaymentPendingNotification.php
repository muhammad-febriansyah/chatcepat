<?php

namespace App\Mail;

use App\Models\Transaction;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentPendingNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Transaction $transaction;
    public ?string $logoUrl;
    public string $appName;
    public string $appUrl;
    public string $supportEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction->load(['user', 'pricingPackage', 'bank']);
        $this->logoUrl = Setting::get('site_logo') ? url('storage/' . Setting::get('site_logo')) : null;
        $this->appName = Setting::get('site_name', config('app.name'));
        $this->appUrl = config('app.url');
        $this->supportEmail = Setting::get('support_email', config('mail.from.address'));
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Menunggu Pembayaran - ' . $this->transaction->invoice_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment.pending',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
