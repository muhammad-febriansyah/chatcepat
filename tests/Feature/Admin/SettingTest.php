<?php

use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'role' => 'admin',
    ]);
});

test('admin can view settings page', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.settings'))
        ->assertOk();
});

test('admin can update mailketing settings', function () {
    $data = [
        'mailketing_from_email' => 'test@example.com',
        'mailketing_api_token' => 'secret-api-token',
        // Include some other existing settings to satisfy validation if necessary
        'site_name' => 'ChatCepat',
        'site_description' => 'Test description',
    ];

    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), $data)
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Setting::get('mailketing_from_email'))->toBe('test@example.com');
    expect(Setting::get('mailketing_api_token'))->toBe('secret-api-token');
});

test('mailketing from email must be a valid email', function () {
    $data = [
        'mailketing_from_email' => 'not-an-email',
        'mailketing_api_token' => 'some-token',
    ];

    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), $data)
        ->assertSessionHasErrors(['mailketing_from_email']);
});

test('mailketing settings clear cache after update', function () {
    Setting::set('mailketing_from_email', 'old@example.com');

    // Ensure it's cached
    Setting::get('mailketing_from_email');
    expect(Cache::has('setting_mailketing_from_email'))->toBeTrue();

    $data = [
        'mailketing_from_email' => 'new@example.com',
        'mailketing_api_token' => 'new-token',
    ];

    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), $data);

    expect(Cache::has('setting_mailketing_from_email'))->toBeFalse();
    expect(Setting::get('mailketing_from_email'))->toBe('new@example.com');
});

test('admin can test mailketing connection', function () {
    Http::fake([
        'api.mailketing.co.id/*' => Http::response(['status' => 'success', 'message' => 'Email sent'], 200),
    ]);

    $data = [
        'recipient_email' => 'recipient@example.com',
        'mailketing_from_email' => 'from@example.com',
        'mailketing_api_token' => 'test-token',
    ];

    $this->actingAs($this->admin)
        ->post(route('admin.settings.mailketing.test'), $data)
        ->assertRedirect()
        ->assertSessionHas('success');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.mailketing.co.id/api/ v1/send' &&
            $request['api_token'] === 'test-token' &&
            $request['recipient'] === 'recipient@example.com';
    });
});
