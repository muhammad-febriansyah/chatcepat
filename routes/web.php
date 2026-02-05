<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// ========================================
// Meta Webhook - MUST BE FIRST! Bypass all middleware
// ========================================
Route::get('/api/meta/webhook', function (Request $request) {
    $mode = $request->query('hub_mode');
    $token = $request->query('hub_verify_token');
    $challenge = $request->query('hub_challenge');

    \Log::info('Meta Webhook verify attempt', [
        'mode' => $mode,
        'token' => $token,
        'challenge' => $challenge,
        'ip' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);

    if ($mode === 'subscribe' && $token === 'chatcepat-meta-webhook-2026') {
        \Log::info('Meta Webhook verification SUCCESS');
        return response($challenge, 200)
            ->header('Content-Type', 'text/plain')
            ->header('Cache-Control', 'no-cache');
    }

    \Log::warning('Meta Webhook verification FAILED', [
        'expected_token' => 'chatcepat-meta-webhook-2026',
        'received_token' => $token,
    ]);

    return response('Forbidden', 403);
});

Route::post('/api/meta/webhook', function (Request $request) {
    \Log::info('Meta Webhook POST received', ['payload' => $request->all()]);

    // Forward to controller for actual processing
    return app(\App\Http\Controllers\Api\MetaWebhookController::class)->handle($request);
});

// Route to refresh CSRF token (for handling 419 errors)
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf.token');

// SEO Routes - Sitemap
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-main.xml', [App\Http\Controllers\SitemapController::class, 'main'])->name('sitemap.main');
Route::get('/sitemap-blog.xml', [App\Http\Controllers\SitemapController::class, 'blog'])->name('sitemap.blog');
Route::get('/sitemap-docs.xml', [App\Http\Controllers\SitemapController::class, 'docs'])->name('sitemap.docs');

// Redirect old sitemaps to new sitemap (for backward compatibility)
Route::get('/sitemap_index.xml', function () {
    return redirect('/sitemap.xml', 301);
});
Route::get('/category-sitemap.xml', function () {
    return redirect('/sitemap.xml', 301);
});
Route::get('/page-sitemap.xml', function () {
    return redirect('/sitemap-main.xml', 301);
});
Route::get('/post-sitemap.xml', function () {
    return redirect('/sitemap-blog.xml', 301);
});

// Return 410 Gone for old WordPress URLs (tell Google these are permanently deleted)
Route::get('/wp-content/{path}', function () {
    abort(410, 'This content has been permanently removed');
})->where('path', '.*');
Route::get('/wp-includes/{path}', function () {
    abort(410, 'This content has been permanently removed');
})->where('path', '.*');
Route::get('/wp-admin/{path?}', function () {
    abort(410, 'This content has been permanently removed');
})->where('path', '.*');

// CSRF Token Refresh Endpoint (for preventing 419 errors on long-running pages)
Route::post('/api/csrf/refresh', [App\Http\Controllers\CsrfTokenController::class, 'refresh'])
    ->middleware('web')
    ->name('csrf.refresh');

Route::get('/', function () {
    $features = App\Models\Feature::active()->ordered()->get();
    $fiturUnggulans = App\Models\FiturUnggulan::active()->ordered()->get();
    $faqs = App\Models\Faq::active()->ordered()->get();
    $testimonials = App\Models\Testimonial::where('is_active', true)
        ->with('user')
        ->latest()
        ->get();
    $partners = App\Models\Partner::active()->ordered()->get();
    return Inertia::render('landing', [
        'canRegister' => Features::enabled(Features::registration()),
        'features' => $features,
        'fiturUnggulans' => $fiturUnggulans,
        'faqs' => $faqs,
        'testimonials' => $testimonials,
        'partners' => $partners,
    ]);
})->name('home');

Route::get('/about', function () {
    $aboutPage = App\Models\AboutPage::where('is_active', true)->first();
    $features = App\Models\Feature::active()->ordered()->get();
    return Inertia::render('about', [
        'canRegister' => Features::enabled(Features::registration()),
        'aboutPage' => $aboutPage,
        'features' => $features,
    ]);
})->name('about');

Route::get('/faq', function () {
    $faqs = App\Models\Faq::all();
    return Inertia::render('faq', [
        'canRegister' => Features::enabled(Features::registration()),
        'faqs' => $faqs,
    ]);
})->name('faq');

Route::get('/terms', function () {
    $page = App\Models\Page::bySlug('terms')->active()->first();
    return Inertia::render('terms', [
        'canRegister' => Features::enabled(Features::registration()),
        'page' => $page,
    ]);
})->name('terms');

Route::get('/privacy', function () {
    $page = App\Models\Page::bySlug('privacy')->active()->first();
    return Inertia::render('privacy', [
        'canRegister' => Features::enabled(Features::registration()),
        'page' => $page,
    ]);
})->name('privacy');

Route::get('/pricing', function () {
    $packages = App\Models\PricingPackage::active()->ordered()->get();
    return Inertia::render('pricing', [
        'canRegister' => Features::enabled(Features::registration()),
        'packages' => $packages,
    ]);
})->name('pricing');

Route::get('/blog', function () {
    $search = request('search');

    $posts = App\Models\Post::published()
        ->with(['category', 'author'])
        ->when($search, function ($query, $search) {
            $query->where('title', 'like', '%' . $search . '%')
                ->orWhere('excerpt', 'like', '%' . $search . '%')
                ->orWhere('content', 'like', '%' . $search . '%');
        })
        ->latest('published_at')
        ->paginate(6)
        ->withQueryString();

    return Inertia::render('blog', [
        'canRegister' => Features::enabled(Features::registration()),
        'posts' => $posts,
        'filters' => [
            'search' => $search,
        ],
    ]);
})->name('blog');

Route::get('/blog/{slug}', function ($slug) {
    $post = App\Models\Post::published()
        ->with(['category', 'author'])
        ->where('slug', $slug)
        ->firstOrFail();

    // Increment views
    $post->increment('views');

    // Get related posts (same category, exclude current post)
    $relatedPosts = App\Models\Post::published()
        ->with(['category', 'author'])
        ->where('blog_category_id', $post->blog_category_id)
        ->where('id', '!=', $post->id)
        ->latest('published_at')
        ->limit(3)
        ->get();

    return Inertia::render('blog-detail', [
        'canRegister' => Features::enabled(Features::registration()),
        'post' => $post,
        'relatedPosts' => $relatedPosts,
    ]);
})->name('blog.show');

Route::get('/contact', function () {
    return Inertia::render('contact', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('contact');

Route::post('/contact', [App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

// Public Documentation/Guides
Route::get('/docs', [App\Http\Controllers\DocsController::class, 'index'])->name('docs.index');
Route::get('/docs/{slug}', [App\Http\Controllers\DocsController::class, 'show'])->name('docs.show');

// WebSocket Test Page (for development/testing)
Route::get('/test-websocket', function () {
    return Inertia::render('test-websocket');
})->name('test-websocket');

// User Dashboard and Panel Routes
Route::middleware(['auth', 'verified'])->prefix('user')->name('user.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\User\DashboardController::class, 'index'])->name('dashboard');

    // Account Settings
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\AccountController::class, 'index'])->name('index');
        Route::put('/profile', [App\Http\Controllers\User\AccountController::class, 'updateProfile'])->name('update-profile');
        Route::put('/password', [App\Http\Controllers\User\AccountController::class, 'updatePassword'])->name('update-password');
        Route::post('/avatar', [App\Http\Controllers\User\AccountController::class, 'updateAvatar'])->name('update-avatar');
    });

    // Email Settings
    Route::prefix('email-settings')->name('email-settings.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\UserEmailController::class, 'index'])->name('index');
        Route::get('/approved', [App\Http\Controllers\User\UserEmailController::class, 'getApprovedEmails'])->name('approved');
        Route::post('/', [App\Http\Controllers\User\UserEmailController::class, 'store'])->name('store');
        Route::delete('/{id}', [App\Http\Controllers\User\UserEmailController::class, 'destroy'])->name('destroy');
    });

    // WhatsApp Management
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\WhatsAppController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\WhatsAppController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\User\WhatsAppController::class, 'store'])->name('store');
        Route::get('/{session}', [App\Http\Controllers\User\WhatsAppController::class, 'show'])->name('show');
        Route::get('/{session}/messages', [App\Http\Controllers\User\WhatsAppController::class, 'messages'])->name('messages');
        Route::get('/{session}/contacts', [App\Http\Controllers\User\WhatsAppController::class, 'contacts'])->name('contacts');
        Route::post('/{session}/connect', [App\Http\Controllers\User\WhatsAppController::class, 'connect'])->name('connect');
        Route::post('/{session}/disconnect', [App\Http\Controllers\User\WhatsAppController::class, 'disconnect'])->name('disconnect');
        Route::delete('/{session}', [App\Http\Controllers\User\WhatsAppController::class, 'destroy'])->name('destroy');

        // Auto-Reply Management
        Route::get('/{session}/auto-replies', [App\Http\Controllers\User\WhatsAppController::class, 'autoReplies'])->name('auto-replies');
        Route::post('/{session}/auto-replies', [App\Http\Controllers\User\WhatsAppController::class, 'storeAutoReply'])->name('auto-replies.store');
        Route::put('/{session}/auto-replies/{autoReply}', [App\Http\Controllers\User\WhatsAppController::class, 'updateAutoReply'])->name('auto-replies.update');
        Route::delete('/{session}/auto-replies/{autoReply}', [App\Http\Controllers\User\WhatsAppController::class, 'destroyAutoReply'])->name('auto-replies.destroy');
        Route::post('/{session}/toggle-auto-reply', [App\Http\Controllers\User\WhatsAppController::class, 'toggleAutoReply'])->name('toggle-auto-reply');
        Route::post('/{session}/settings', [App\Http\Controllers\User\WhatsAppController::class, 'updateSettings'])->name('settings.update');
    });

    // Scraper Management
    Route::prefix('scraper')->name('scraper.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ScraperController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\ScraperController::class, 'create'])->name('create');
        Route::post('/scrape', [App\Http\Controllers\User\ScraperController::class, 'scrape'])->name('scrape');
        Route::get('/maps', [App\Http\Controllers\User\ScraperController::class, 'maps'])->name('maps');
        Route::get('/export/excel', [App\Http\Controllers\User\ScraperController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [App\Http\Controllers\User\ScraperController::class, 'exportPdf'])->name('export.pdf');
        Route::delete('/{place}', [App\Http\Controllers\User\ScraperController::class, 'destroy'])->name('destroy');
        Route::delete('/', [App\Http\Controllers\User\ScraperController::class, 'destroyAll'])->name('destroy-all');

        // WhatsApp Scraping (Baileys)
        Route::get('/contacts', [App\Http\Controllers\User\ScraperController::class, 'contacts'])->name('contacts');
        Route::get('/groups', [App\Http\Controllers\User\ScraperController::class, 'groups'])->name('groups');

        // Meta Scraping (WhatsApp Cloud API, Facebook, Instagram)
        Route::post('/meta/whatsapp', [App\Http\Controllers\User\ScraperController::class, 'scrapeMetaWhatsApp'])->name('meta.whatsapp');
        Route::post('/meta/facebook', [App\Http\Controllers\User\ScraperController::class, 'scrapeMetaFacebook'])->name('meta.facebook');
        Route::post('/meta/instagram', [App\Http\Controllers\User\ScraperController::class, 'scrapeMetaInstagram'])->name('meta.instagram');
        Route::get('/meta/contacts', [App\Http\Controllers\User\ScraperController::class, 'getMetaContacts'])->name('meta.contacts');
        Route::get('/meta/stats', [App\Http\Controllers\User\ScraperController::class, 'getMetaContactsStats'])->name('meta.stats');
    });

    // Contacts Management
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ContactController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\ContactController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\User\ContactController::class, 'store'])->name('store');
        Route::get('/{contact}/edit', [App\Http\Controllers\User\ContactController::class, 'edit'])->name('edit');
        Route::put('/{contact}', [App\Http\Controllers\User\ContactController::class, 'update'])->name('update');
        Route::delete('/{contact}', [App\Http\Controllers\User\ContactController::class, 'destroy'])->name('destroy');

        // Scraping endpoints
        Route::post('/scrape', [App\Http\Controllers\User\ContactController::class, 'scrapeContacts'])->name('scrape');
        Route::post('/scrape/whatsapp-cloud', [App\Http\Controllers\User\ContactController::class, 'scrapeWhatsAppCloudContacts'])->name('scrape.whatsapp-cloud');
        Route::post('/scrape/facebook', [App\Http\Controllers\User\ContactController::class, 'scrapeFacebookContacts'])->name('scrape.facebook');
        Route::post('/scrape/instagram', [App\Http\Controllers\User\ContactController::class, 'scrapeInstagramFollowers'])->name('scrape.instagram');
        Route::post('/scrape/status', [App\Http\Controllers\User\ContactController::class, 'checkScrapingStatus'])->name('scrape.status');
        Route::get('/scrape/history', [App\Http\Controllers\User\ContactController::class, 'scrapingHistory'])->name('scrape.history');
        Route::post('/scrape/reset', [App\Http\Controllers\User\ContactController::class, 'resetScrapingCooldown'])->name('scrape.reset');

        // Import endpoints
        Route::post('/import', [App\Http\Controllers\User\ContactController::class, 'importExcel'])->name('import');
        Route::get('/template', [App\Http\Controllers\User\ContactController::class, 'downloadTemplate'])->name('template');
    });

    // Groups Management
    Route::prefix('groups')->name('groups.')->group(function () {
        // Scraping endpoints
        Route::post('/scrape', [App\Http\Controllers\User\ContactController::class, 'scrapeGroups'])->name('scrape');
        Route::post('/scrape/whatsapp-cloud', [App\Http\Controllers\User\ContactController::class, 'scrapeWhatsAppCloudGroups'])->name('scrape.whatsapp-cloud');

        // Group members
        Route::post('/{group}/members/scrape', [App\Http\Controllers\User\ScraperController::class, 'scrapeGroupMembers'])->name('members.scrape');
        Route::get('/{group}/members', [App\Http\Controllers\User\ScraperController::class, 'getGroupMembers'])->name('members');
    });

    // WhatsApp Broadcast
    Route::prefix('broadcast')->name('broadcast.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\BroadcastController::class, 'index'])->name('index');
        Route::post('/send', [App\Http\Controllers\User\BroadcastController::class, 'send'])->name('send');

        // Group Broadcast
        Route::get('/groups', [App\Http\Controllers\User\GroupBroadcastController::class, 'index'])->name('groups');
        Route::get('/groups/list', [App\Http\Controllers\User\GroupBroadcastController::class, 'getGroups'])->name('groups.list');
        Route::post('/groups/send', [App\Http\Controllers\User\GroupBroadcastController::class, 'send'])->name('groups.send');
    });

    // Email Broadcast (Unified)
    Route::prefix('email-broadcast')->name('email-broadcast.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\EmailBroadcastController::class, 'index'])->name('index');
        Route::post('/send', [App\Http\Controllers\User\EmailBroadcastController::class, 'send'])->name('send');
        Route::get('/history', [App\Http\Controllers\User\EmailBroadcastController::class, 'history'])->name('history');
        Route::get('/{broadcast}', [App\Http\Controllers\User\EmailBroadcastController::class, 'show'])->name('show');
    });

    // Legacy Email Broadcast Route (Redirect to unified route)
    Route::get('user/broadcast/email', function () {
        return redirect()->route('user.email-broadcast.index');
    });

    // Contact Groups (untuk broadcast)
    Route::prefix('contact-groups')->name('contact-groups.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ContactGroupController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\User\ContactGroupController::class, 'store'])->name('store');
        Route::put('/{contactGroup}', [App\Http\Controllers\User\ContactGroupController::class, 'update'])->name('update');
        Route::delete('/{contactGroup}', [App\Http\Controllers\User\ContactGroupController::class, 'destroy'])->name('destroy');
        Route::post('/{contactGroup}/members', [App\Http\Controllers\User\ContactGroupController::class, 'addMembers'])->name('members.add');
        Route::delete('/{contactGroup}/members/{member}', [App\Http\Controllers\User\ContactGroupController::class, 'removeMember'])->name('members.remove');
        Route::post('/{contactGroup}/members/bulk-delete', [App\Http\Controllers\User\ContactGroupController::class, 'bulkDeleteMembers'])->name('members.bulk-delete');
        Route::post('/sync-whatsapp', [App\Http\Controllers\User\ContactGroupController::class, 'syncFromWhatsApp'])->name('sync-whatsapp');
        Route::get('/for-broadcast', [App\Http\Controllers\User\ContactGroupController::class, 'getGroupsForBroadcast'])->name('for-broadcast');
        Route::get('/{contactGroup}/members', [App\Http\Controllers\User\ContactGroupController::class, 'getGroupMembers'])->name('members');
    });

    // Reply Manual
    Route::prefix('reply-manual')->name('reply-manual.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ReplyManualController::class, 'index'])->name('index');
        Route::get('/fullscreen', [App\Http\Controllers\User\ReplyManualController::class, 'fullscreen'])->name('fullscreen');
        Route::post('/messages', [App\Http\Controllers\User\ReplyManualController::class, 'getMessages'])->name('messages');
        Route::post('/contacts', [App\Http\Controllers\User\ReplyManualController::class, 'getContacts'])->name('contacts');
        Route::post('/send', [App\Http\Controllers\User\ReplyManualController::class, 'send'])->name('send');
        Route::post('/send-media', [App\Http\Controllers\User\ReplyManualController::class, 'sendMedia'])->name('send-media');
        Route::post('/update-contact', [App\Http\Controllers\User\ReplyManualController::class, 'updateContactName'])->name('update-contact');
    });

    // Chatbot AI
    Route::prefix('chatbot')->name('chatbot.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ChatbotController::class, 'index'])->name('index');
        Route::post('/{session}/settings', [App\Http\Controllers\User\ChatbotController::class, 'updateSettings'])->name('settings');
        Route::post('/{session}/test', [App\Http\Controllers\User\ChatbotController::class, 'testChatbot'])->name('test');
        Route::post('/{session}/upload-training-pdf', [App\Http\Controllers\User\ChatbotController::class, 'uploadTrainingPdf'])->name('upload-pdf');
        Route::delete('/{session}/delete-training-pdf', [App\Http\Controllers\User\ChatbotController::class, 'deleteTrainingPdf'])->name('delete-pdf');
    });

    // Products Management
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ProductController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\ProductController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\User\ProductController::class, 'store'])->name('store');
        Route::get('/{product}/edit', [App\Http\Controllers\User\ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [App\Http\Controllers\User\ProductController::class, 'update'])->name('update');
        Route::delete('/{product}', [App\Http\Controllers\User\ProductController::class, 'destroy'])->name('destroy');
        Route::post('/{product}/toggle-status', [App\Http\Controllers\User\ProductController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/{product}/duplicate', [App\Http\Controllers\User\ProductController::class, 'duplicate'])->name('duplicate');
        Route::get('/{product}/message', [App\Http\Controllers\User\ProductController::class, 'getMessage'])->name('message');
        Route::get('/api/list', [App\Http\Controllers\User\ProductController::class, 'getProducts'])->name('api.list');
    });

    // Human Agents Management (CRM)
    Route::prefix('human-agents')->name('human-agents.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\HumanAgentController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\User\HumanAgentController::class, 'store'])->name('store');
        Route::put('/{humanAgent}', [App\Http\Controllers\User\HumanAgentController::class, 'update'])->name('update');
        Route::delete('/{humanAgent}', [App\Http\Controllers\User\HumanAgentController::class, 'destroy'])->name('destroy');
        Route::post('/{humanAgent}/toggle-status', [App\Http\Controllers\User\HumanAgentController::class, 'toggleStatus'])->name('toggle-status');
    });

    // CRM Chat App
    Route::prefix('crm-chat')->name('crm-chat.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\CrmChatController::class, 'index'])->name('index');
        Route::get('/connect/whatsapp', [App\Http\Controllers\User\CrmChatController::class, 'connectWhatsAppForm'])->name('connect.whatsapp');
        Route::post('/connect/whatsapp', [App\Http\Controllers\User\CrmChatController::class, 'storeWhatsApp'])->name('connect.whatsapp.store');
        Route::get('/connect/instagram', [App\Http\Controllers\User\CrmChatController::class, 'connectInstagramForm'])->name('connect.instagram');
        Route::post('/connect/instagram', [App\Http\Controllers\User\CrmChatController::class, 'storeInstagram'])->name('connect.instagram.store');
        Route::get('/connect/messenger', [App\Http\Controllers\User\CrmChatController::class, 'connectMessengerForm'])->name('connect.messenger');
        Route::post('/connect/messenger', [App\Http\Controllers\User\CrmChatController::class, 'storeMessenger'])->name('connect.messenger.store');
        Route::delete('/disconnect/{id}', [App\Http\Controllers\User\CrmChatController::class, 'disconnect'])->name('disconnect');
    });

    // Telegram Management
    Route::prefix('telegram')->name('telegram.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\TelegramController::class, 'index'])->name('index');

        // Session Management
        Route::prefix('session')->name('session.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\TelegramSessionController::class, 'index'])->name('index');
            Route::post('/send-code', [App\Http\Controllers\User\TelegramSessionController::class, 'sendCode'])->name('send-code');
            Route::post('/verify-code', [App\Http\Controllers\User\TelegramSessionController::class, 'verifyCode'])->name('verify-code');
            Route::get('/check-status', [App\Http\Controllers\User\TelegramSessionController::class, 'checkStatus'])->name('check-status');
            Route::post('/logout', [App\Http\Controllers\User\TelegramSessionController::class, 'logout'])->name('logout');
        });

        // Bot Management
        Route::prefix('bots')->name('bots.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\TelegramBotController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\User\TelegramBotController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\User\TelegramBotController::class, 'store'])->name('store');
            Route::post('/{bot}/toggle-active', [App\Http\Controllers\User\TelegramBotController::class, 'toggleActive'])->name('toggle-active');
            Route::post('/{bot}/toggle-auto-reply', [App\Http\Controllers\User\TelegramBotController::class, 'toggleAutoReply'])->name('toggle-auto-reply');
            Route::delete('/{bot}', [App\Http\Controllers\User\TelegramBotController::class, 'destroy'])->name('destroy');
        });

        // Messages
        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\TelegramMessageController::class, 'index'])->name('index');
            Route::post('/send-text', [App\Http\Controllers\User\TelegramMessageController::class, 'sendText'])->name('send-text');
            Route::post('/send-file', [App\Http\Controllers\User\TelegramMessageController::class, 'sendFile'])->name('send-file');
            Route::get('/{bot}/{chatId}', [App\Http\Controllers\User\TelegramMessageController::class, 'getChat'])->name('get-chat');
        });

        // Broadcasts
        Route::prefix('broadcasts')->name('broadcasts.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\TelegramBroadcastController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\User\TelegramBroadcastController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\User\TelegramBroadcastController::class, 'store'])->name('store');
            Route::get('/{broadcast}', [App\Http\Controllers\User\TelegramBroadcastController::class, 'show'])->name('show');
        });

        // Auto Replies
        Route::prefix('auto-replies')->name('auto-replies.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\TelegramAutoReplyController::class, 'index'])->name('index');
            Route::post('/', [App\Http\Controllers\User\TelegramAutoReplyController::class, 'store'])->name('store');
            Route::put('/{autoReply}', [App\Http\Controllers\User\TelegramAutoReplyController::class, 'update'])->name('update');
            Route::post('/{autoReply}/toggle', [App\Http\Controllers\User\TelegramAutoReplyController::class, 'toggleActive'])->name('toggle');
            Route::delete('/{autoReply}', [App\Http\Controllers\User\TelegramAutoReplyController::class, 'destroy'])->name('destroy');
        });
    });


    // Top Up / Upgrade Package
    Route::get('/topup', [App\Http\Controllers\User\TopUpController::class, 'index'])->name('topup');

    // Transaction History
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\TransactionController::class, 'index'])->name('index');
        Route::get('/{transaction}', [App\Http\Controllers\User\TransactionController::class, 'show'])->name('show');
    });

    // Message Templates
    Route::prefix('templates')->name('templates.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\TemplateController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\TemplateController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\User\TemplateController::class, 'store'])->name('store');
        Route::get('/{template}/edit', [App\Http\Controllers\User\TemplateController::class, 'edit'])->name('edit');
        Route::put('/{template}', [App\Http\Controllers\User\TemplateController::class, 'update'])->name('update');
        Route::delete('/{template}', [App\Http\Controllers\User\TemplateController::class, 'destroy'])->name('destroy');
        Route::post('/{template}/duplicate', [App\Http\Controllers\User\TemplateController::class, 'duplicate'])->name('duplicate');

        // Email Templates (alias route - redirects to templates with type=email)
        Route::get('/email', function () {
            return redirect()->route('user.templates.index', ['type' => 'email']);
        })->name('email');
    });

    // Guides / Bantuan - Redirect to public docs
    Route::get('/guides', function () {
        return redirect()->route('docs.index');
    })->name('guides.index');
    Route::get('/guides/{slug}', function ($slug) {
        return redirect()->route('docs.show', $slug);
    })->name('guides.show');

    // SMTP Settings
    Route::prefix('smtp-settings')->name('smtp-settings.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\SmtpSettingController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\User\SmtpSettingController::class, 'store'])->name('store');
        Route::put('/{smtpSetting}', [App\Http\Controllers\User\SmtpSettingController::class, 'update'])->name('update');
        Route::delete('/{smtpSetting}', [App\Http\Controllers\User\SmtpSettingController::class, 'destroy'])->name('destroy');
        Route::post('/{smtpSetting}/set-active', [App\Http\Controllers\User\SmtpSettingController::class, 'setActive'])->name('set-active');
        Route::post('/{smtpSetting}/test', [App\Http\Controllers\User\SmtpSettingController::class, 'test'])->name('test');
    });

    // Email Broadcast is now handled above in unified prefix

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ReportController::class, 'index'])->name('index');
        Route::get('/broadcast', [App\Http\Controllers\User\ReportController::class, 'broadcast'])->name('broadcast');
        Route::get('/scraping', [App\Http\Controllers\User\ReportController::class, 'scraping'])->name('scraping');
        Route::get('/chatbot', [App\Http\Controllers\User\ReportController::class, 'chatbot'])->name('chatbot');
        Route::get('/general', [App\Http\Controllers\User\ReportController::class, 'general'])->name('general');
    });

    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ActivityLogController::class, 'index'])->name('index');
        Route::get('/{activityLog}', [App\Http\Controllers\User\ActivityLogController::class, 'show'])->name('show');
    });

    // Meta Integration (WhatsApp Business, Instagram, Facebook)
    Route::prefix('meta')->name('meta.')->group(function () {
        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\MetaSettingsController::class, 'index'])->name('index');
            Route::post('/whatsapp', [App\Http\Controllers\User\MetaSettingsController::class, 'updateWhatsApp'])->name('update-whatsapp');
            Route::post('/instagram', [App\Http\Controllers\User\MetaSettingsController::class, 'updateInstagram'])->name('update-instagram');
            Route::post('/facebook', [App\Http\Controllers\User\MetaSettingsController::class, 'updateFacebook'])->name('update-facebook');
            Route::post('/test-connection', [App\Http\Controllers\User\MetaSettingsController::class, 'testConnection'])->name('test-connection');
            Route::post('/disconnect', [App\Http\Controllers\User\MetaSettingsController::class, 'disconnect'])->name('disconnect');
        });

        // Auto Reply Management
        Route::prefix('auto-reply')->name('auto-reply.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\MetaAutoReplyController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\User\MetaAutoReplyController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\User\MetaAutoReplyController::class, 'store'])->name('store');
            Route::get('/{autoReply}/edit', [App\Http\Controllers\User\MetaAutoReplyController::class, 'edit'])->name('edit');
            Route::put('/{autoReply}', [App\Http\Controllers\User\MetaAutoReplyController::class, 'update'])->name('update');
            Route::delete('/{autoReply}', [App\Http\Controllers\User\MetaAutoReplyController::class, 'destroy'])->name('destroy');
            Route::post('/{autoReply}/toggle', [App\Http\Controllers\User\MetaAutoReplyController::class, 'toggleStatus'])->name('toggle');
            Route::post('/{autoReply}/duplicate', [App\Http\Controllers\User\MetaAutoReplyController::class, 'duplicate'])->name('duplicate');
        });

        // Broadcast Management
        Route::prefix('broadcast')->name('broadcast.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\MetaBroadcastController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\User\MetaBroadcastController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\User\MetaBroadcastController::class, 'store'])->name('store');
            Route::get('/{broadcast}', [App\Http\Controllers\User\MetaBroadcastController::class, 'show'])->name('show');
            Route::post('/{broadcast}/cancel', [App\Http\Controllers\User\MetaBroadcastController::class, 'cancel'])->name('cancel');
            Route::delete('/{broadcast}', [App\Http\Controllers\User\MetaBroadcastController::class, 'destroy'])->name('destroy');
        });

        // Contact Management
        Route::prefix('contacts')->name('contacts.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\MetaContactController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\User\MetaContactController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\User\MetaContactController::class, 'store'])->name('store');
            Route::get('/{contact}/edit', [App\Http\Controllers\User\MetaContactController::class, 'edit'])->name('edit');
            Route::put('/{contact}', [App\Http\Controllers\User\MetaContactController::class, 'update'])->name('update');
            Route::delete('/{contact}', [App\Http\Controllers\User\MetaContactController::class, 'destroy'])->name('destroy');
            Route::post('/{contact}/toggle-block', [App\Http\Controllers\User\MetaContactController::class, 'toggleBlock'])->name('toggle-block');
            Route::post('/bulk-delete', [App\Http\Controllers\User\MetaContactController::class, 'bulkDelete'])->name('bulk-delete');
            Route::get('/export', [App\Http\Controllers\User\MetaContactController::class, 'export'])->name('export');
            Route::post('/import', [App\Http\Controllers\User\MetaContactController::class, 'import'])->name('import');
        });

        // Messaging / Chat
        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [App\Http\Controllers\User\MetaMessagingController::class, 'index'])->name('index');
            Route::post('/whatsapp/send', [App\Http\Controllers\User\MetaMessagingController::class, 'sendWhatsApp'])->name('send-whatsapp');
            Route::post('/instagram/send', [App\Http\Controllers\User\MetaMessagingController::class, 'sendInstagram'])->name('send-instagram');
            Route::post('/facebook/send', [App\Http\Controllers\User\MetaMessagingController::class, 'sendFacebook'])->name('send-facebook');
            Route::get('/whatsapp', [App\Http\Controllers\User\MetaMessagingController::class, 'getWhatsAppMessages'])->name('whatsapp');
            Route::get('/instagram', [App\Http\Controllers\User\MetaMessagingController::class, 'getInstagramMessages'])->name('instagram');
            Route::get('/facebook', [App\Http\Controllers\User\MetaMessagingController::class, 'getFacebookMessages'])->name('facebook');
        });

        // Facebook Messenger Page
        Route::get('/messenger', [App\Http\Controllers\User\MetaMessagingController::class, 'messengerIndex'])->name('messenger.index');

        // Instagram DM Page
        Route::get('/instagram', [App\Http\Controllers\User\MetaMessagingController::class, 'instagramIndex'])->name('instagram.index');
    });

    // Widget Live Chat
    Route::prefix('widget')->name('widget.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\WidgetController::class, 'index'])->name('index');
        Route::post('/settings', [App\Http\Controllers\User\WidgetController::class, 'updateSettings'])->name('update-settings');
        Route::get('/script', [App\Http\Controllers\User\WidgetController::class, 'generateScript'])->name('script');
    });

    // Up Selling
    Route::prefix('upselling')->name('upselling.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\UpSellingController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\User\UpSellingController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\User\UpSellingController::class, 'store'])->name('store');
        Route::get('/{campaign}/edit', [App\Http\Controllers\User\UpSellingController::class, 'edit'])->name('edit');
        Route::put('/{campaign}', [App\Http\Controllers\User\UpSellingController::class, 'update'])->name('update');
        Route::delete('/{campaign}', [App\Http\Controllers\User\UpSellingController::class, 'destroy'])->name('destroy');
        Route::post('/{campaign}/toggle', [App\Http\Controllers\User\UpSellingController::class, 'toggle'])->name('toggle');
    });

    // AI Credit Top Up
    Route::prefix('ai-credit')->name('ai-credit.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\AICreditController::class, 'index'])->name('index');
        Route::post('/purchase', [App\Http\Controllers\User\AICreditController::class, 'purchase'])->name('purchase');
        Route::get('/history', [App\Http\Controllers\User\AICreditController::class, 'history'])->name('history');
    });
});

// Legacy dashboard route (redirect to new route)
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return redirect()->route('user.dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');

    // FAQs
    Route::resource('faqs', App\Http\Controllers\Admin\FaqController::class);

    // Guides
    Route::prefix('guides')->name('guides.')->group(function () {
        Route::resource('categories', App\Http\Controllers\Admin\GuideCategoryController::class);
        Route::resource('articles', App\Http\Controllers\Admin\GuideArticleController::class);
    });

    // Contacts
    Route::resource('contacts', App\Http\Controllers\Admin\ContactController::class)->only(['index', 'show', 'destroy']);
    Route::patch('/contacts/{contact}/mark-as-read', [App\Http\Controllers\Admin\ContactController::class, 'markAsRead'])->name('contacts.mark-as-read');

    // Features
    Route::resource('features', App\Http\Controllers\Admin\FeatureController::class)->except(['show']);

    // Fitur Unggulan
    Route::resource('fitur-unggulan', App\Http\Controllers\Admin\FiturUnggulanController::class)->except(['show']);

    // Partners
    Route::resource('partners', App\Http\Controllers\Admin\PartnerController::class)->except(['show', 'create', 'edit']);

    // Pricing Packages
    Route::resource('pricing-packages', App\Http\Controllers\Admin\PricingPackageController::class)->except(['show']);

    // Banks
    Route::resource('banks', App\Http\Controllers\Admin\BankController::class)->except(['show', 'create', 'edit']);

    // AI Assistant Types
    Route::resource('ai-assistant-types', App\Http\Controllers\Admin\AiAssistantTypeController::class)->except(['show', 'create', 'edit']);

    // Meta Management (Templates, Webhook Logs)
    Route::prefix('meta')->name('meta.')->group(function () {

        // Message Templates
        Route::resource('templates', App\Http\Controllers\Admin\MetaTemplateController::class);
        Route::post('/templates/{template}/toggle', [App\Http\Controllers\Admin\MetaTemplateController::class, 'toggle'])->name('templates.toggle');
        Route::post('/templates/{template}/duplicate', [App\Http\Controllers\Admin\MetaTemplateController::class, 'duplicate'])->name('templates.duplicate');

        // Webhook Logs
        Route::get('/webhook-logs', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'index'])->name('webhook-logs.index');
        Route::get('/webhook-logs/{webhookLog}', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'show'])->name('webhook-logs.show');
        Route::delete('/webhook-logs/{webhookLog}', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'destroy'])->name('webhook-logs.destroy');
        Route::post('/webhook-logs/cleanup', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'cleanup'])->name('webhook-logs.cleanup');
        Route::post('/webhook-logs/{webhookLog}/retry', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'retry'])->name('webhook-logs.retry');
        Route::get('/webhook-logs-export', [App\Http\Controllers\Admin\MetaWebhookLogController::class, 'export'])->name('webhook-logs.export');
    });

    // Transactions
    Route::get('/transactions', [App\Http\Controllers\Admin\TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{id}', [App\Http\Controllers\Admin\TransactionController::class, 'show'])->name('transactions.show');
    Route::put('/transactions/{id}/status', [App\Http\Controllers\Admin\TransactionController::class, 'updateStatus'])->name('transactions.update-status');
    Route::delete('/transactions/{id}', [App\Http\Controllers\Admin\TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Blog
    Route::prefix('blog')->name('blog.')->group(function () {
        Route::resource('categories', App\Http\Controllers\Admin\BlogCategoryController::class);
        Route::resource('posts', App\Http\Controllers\Admin\PostController::class);
    });

    // Pages
    Route::get('/pages', [App\Http\Controllers\Admin\PageController::class, 'index'])->name('pages.index');
    Route::get('/pages/{slug}', [App\Http\Controllers\Admin\PageController::class, 'editBySlug'])->name('pages.edit.slug')->where('slug', '[a-z-]+');
    Route::put('/pages/{slug}', [App\Http\Controllers\Admin\PageController::class, 'updateBySlug'])->name('pages.update.slug')->where('slug', '[a-z-]+');
    Route::get('/pages/{id}/edit', [App\Http\Controllers\Admin\PageController::class, 'edit'])->name('pages.edit')->where('id', '[0-9]+');
    Route::put('/pages/{id}', [App\Http\Controllers\Admin\PageController::class, 'update'])->name('pages.update')->where('id', '[0-9]+');

    // Users
    Route::resource('users', App\Http\Controllers\Admin\UserController::class)->except(['show']);

    // Email Verifications
    Route::prefix('email-verifications')->name('email-verifications.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AdminEmailVerificationController::class, 'index'])->name('index');
        Route::post('/{id}/approve', [App\Http\Controllers\Admin\AdminEmailVerificationController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [App\Http\Controllers\Admin\AdminEmailVerificationController::class, 'reject'])->name('reject');
        Route::post('/{id}/resend', [App\Http\Controllers\Admin\AdminEmailVerificationController::class, 'resendVerification'])->name('resend');
    });

    // Settings
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings');
    Route::put('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/mailketing/test', [App\Http\Controllers\Admin\SettingController::class, 'testMailketing'])->name('settings.mailketing.test');

    // Scraper Categories
    Route::resource('scraper-categories', App\Http\Controllers\Admin\ScraperCategoryController::class)->except(['show']);

    // Google Maps Scraper
    Route::get('/google-maps-scraper', [App\Http\Controllers\GoogleMapScraperController::class, 'index'])->name('google-maps-scraper.index');
    Route::get('/google-maps-scraper/maps', [App\Http\Controllers\GoogleMapScraperController::class, 'maps'])->name('google-maps-scraper.maps');
    Route::get('/google-maps-scraper/results', [App\Http\Controllers\GoogleMapScraperController::class, 'results'])->name('google-maps-scraper.results');
    Route::post('/google-maps-scraper/scrape', [App\Http\Controllers\GoogleMapScraperController::class, 'scrape'])->name('google-maps-scraper.scrape');
    Route::get('/google-maps-scraper/job-status/{jobId}', [App\Http\Controllers\GoogleMapScraperController::class, 'jobStatus'])->name('google-maps-scraper.job-status');
    Route::get('/google-maps-scraper/export/excel', [App\Http\Controllers\GoogleMapScraperController::class, 'exportExcel'])->name('google-maps-scraper.export.excel');
    Route::get('/google-maps-scraper/export/pdf', [App\Http\Controllers\GoogleMapScraperController::class, 'exportPdf'])->name('google-maps-scraper.export.pdf');
    Route::delete('/google-maps-scraper/{place}', [App\Http\Controllers\GoogleMapScraperController::class, 'destroy'])->name('google-maps-scraper.destroy');

    // WhatsApp Management
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        // Sessions - No middleware needed (used to create/manage sessions)
        Route::resource('sessions', App\Http\Controllers\Admin\WhatsAppSessionController::class);
        Route::post('/sessions/{session}/connect', [App\Http\Controllers\Admin\WhatsAppSessionController::class, 'connect'])->name('sessions.connect');
        Route::post('/sessions/{session}/disconnect', [App\Http\Controllers\Admin\WhatsAppSessionController::class, 'disconnect'])->name('sessions.disconnect');
        Route::post('/sessions/{session}/logout', [App\Http\Controllers\Admin\WhatsAppSessionController::class, 'logout'])->name('sessions.logout');
        Route::post('/sessions/{session}/cleanup', [App\Http\Controllers\Admin\WhatsAppSessionController::class, 'cleanup'])->name('sessions.cleanup');

        // Routes that require active WhatsApp session
        Route::middleware('whatsapp.session')->group(function () {
            // Broadcasts
            Route::resource('broadcasts', App\Http\Controllers\Admin\WhatsAppBroadcastController::class);
            Route::post('/broadcasts/{broadcast}/execute', [App\Http\Controllers\Admin\WhatsAppBroadcastController::class, 'execute'])->name('broadcasts.execute');
            Route::post('/broadcasts/{broadcast}/cancel', [App\Http\Controllers\Admin\WhatsAppBroadcastController::class, 'cancel'])->name('broadcasts.cancel');
            Route::get('/broadcasts-statistics', [App\Http\Controllers\Admin\WhatsAppBroadcastController::class, 'statistics'])->name('broadcasts.statistics');

            // Messages
            Route::get('/messages', [App\Http\Controllers\Admin\WhatsAppMessageController::class, 'index'])->name('messages.index');
            Route::get('/messages/{message}', [App\Http\Controllers\Admin\WhatsAppMessageController::class, 'show'])->name('messages.show');
            Route::get('/messages/conversation/{sessionId}/{phoneNumber}', [App\Http\Controllers\Admin\WhatsAppMessageController::class, 'conversation'])->name('messages.conversation');

            // Message Templates
            Route::resource('message-templates', App\Http\Controllers\Admin\WhatsAppMessageTemplateController::class);
            Route::post('/message-templates/{messageTemplate}/toggle-active', [App\Http\Controllers\Admin\WhatsAppMessageTemplateController::class, 'toggleActive'])->name('message-templates.toggle-active');

            // Auto-Replies
            Route::resource('auto-replies', App\Http\Controllers\Admin\WhatsAppAutoReplyController::class);
        });

        // Contacts - No middleware (read-only data)
        Route::get('/contacts', [App\Http\Controllers\Admin\WhatsAppContactController::class, 'index'])->name('contacts.index');
        Route::get('/contacts/{contact}', [App\Http\Controllers\Admin\WhatsAppContactController::class, 'show'])->name('contacts.show');
        Route::delete('/contacts/{contact}', [App\Http\Controllers\Admin\WhatsAppContactController::class, 'destroy'])->name('contacts.destroy');
    });
});

Route::get('/checkuser', [UserController::class, 'checkCustomer'])->name('checkuser');
Route::post('/check-customer', [UserController::class, 'checkCustomer']);

// Payment Routes (no verified middleware - allow new users to pay before email verification)
Route::middleware(['auth'])->prefix('payment')->name('payment.')->group(function () {
    Route::get('/', [App\Http\Controllers\PaymentController::class, 'index'])->name('index');
    Route::post('/create', [App\Http\Controllers\PaymentController::class, 'createPayment'])->name('create');
    Route::post('/create-manual', [App\Http\Controllers\PaymentController::class, 'createManualPayment'])->name('create-manual');
    Route::get('/transactions', [App\Http\Controllers\PaymentController::class, 'transactions'])->name('transactions');
    Route::get('/transactions/{id}', [App\Http\Controllers\PaymentController::class, 'show'])->name('show');
    Route::get('/check-status/{id}', [App\Http\Controllers\PaymentController::class, 'checkStatus'])->name('check-status');
});

// Payment Callback & Return (no auth required)
Route::post('/payment/callback', [App\Http\Controllers\PaymentController::class, 'callback'])->name('payment.callback');
Route::get('/payment/return', [App\Http\Controllers\PaymentController::class, 'return'])->name('payment.return');

// Custom Password Reset Route (override Fortify to handle authenticated users)
// This route logs out authenticated users before showing the reset form
Route::get('/reset-password/{token}', function (Request $request, $token) {
    // If user is authenticated, log them out first
    if ($request->user()) {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    $settings = App\Models\Setting::first();
    $authBranding = [
        'logo' => App\Models\Setting::get('auth_logo')
            ? '/storage/' . App\Models\Setting::get('auth_logo')
            : (App\Models\Setting::get('logo') ? '/storage/' . App\Models\Setting::get('logo') : null),
        'logo_name' => App\Models\Setting::get('auth_logo_name', 'ChatCepat'),
        'tagline' => App\Models\Setting::get('auth_tagline', 'Smart, Fast & Reliable'),
        'heading' => App\Models\Setting::get('auth_heading', 'Kelola website Anda dengan mudah dan cepat'),
        'description' => App\Models\Setting::get('auth_description', 'Platform manajemen konten modern dengan fitur lengkap untuk mengembangkan bisnis Anda.'),
        'features' => json_decode(App\Models\Setting::get('auth_features', json_encode([
            'Dashboard analytics yang powerful',
            'Manajemen konten yang intuitif',
            'Keamanan tingkat enterprise',
        ])), true),
        'copyright' => App\Models\Setting::get('auth_copyright', '© 2025 ChatCepat. All rights reserved.'),
        'hero_image' => App\Models\Setting::get('auth_hero_image') ? '/storage/' . App\Models\Setting::get('auth_hero_image') : null,
    ];

    return Inertia::render('auth/reset-password', [
        'email' => $request->email,
        'token' => $token,
        'authBranding' => $authBranding,
    ]);
})->middleware('web')->name('password.reset');

// Agent Authentication Routes
Route::prefix('agent')->name('agent.')->group(function () {
    // Guest routes (login)
    Route::middleware('guest:agent')->group(function () {
        Route::get('/login', [App\Http\Controllers\Agent\AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [App\Http\Controllers\Agent\AuthController::class, 'login'])->name('login.post');
    });

    // Protected agent routes
    Route::middleware('agent')->group(function () {
        Route::post('/logout', [App\Http\Controllers\Agent\AuthController::class, 'logout'])->name('logout');
        Route::get('/dashboard', [App\Http\Controllers\Agent\DashboardController::class, 'index'])->name('dashboard');

        // Chat operations
        Route::prefix('chat')->name('chat.')->group(function () {
            Route::get('/', [App\Http\Controllers\Agent\ChatController::class, 'index'])->name('index');
            Route::get('/conversations', [App\Http\Controllers\Agent\ChatController::class, 'getConversations'])->name('conversations');
            Route::get('/conversations/{conversation}/messages', [App\Http\Controllers\Agent\ChatController::class, 'getMessages'])->name('messages');
            Route::post('/conversations/{conversation}/send', [App\Http\Controllers\Agent\ChatController::class, 'sendMessage'])->name('send');
            Route::put('/conversations/{conversation}/status', [App\Http\Controllers\Agent\ChatController::class, 'updateStatus'])->name('status');
            Route::post('/conversations/{conversation}/transfer', [App\Http\Controllers\Agent\ChatController::class, 'transferConversation'])->name('transfer');
        });
    });
});
