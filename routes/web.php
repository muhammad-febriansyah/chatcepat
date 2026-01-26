<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route to refresh CSRF token (for handling 419 errors)
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf.token');

// SEO Routes - Sitemap
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-main.xml', [App\Http\Controllers\SitemapController::class, 'main'])->name('sitemap.main');
Route::get('/sitemap-blog.xml', [App\Http\Controllers\SitemapController::class, 'blog'])->name('sitemap.blog');

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

        // WhatsApp Scraping
        Route::get('/contacts', [App\Http\Controllers\User\ScraperController::class, 'contacts'])->name('contacts');
        Route::get('/groups', [App\Http\Controllers\User\ScraperController::class, 'groups'])->name('groups');
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

    // Contact Groups (untuk broadcast)
    Route::prefix('contact-groups')->name('contact-groups.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\ContactGroupController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\User\ContactGroupController::class, 'store'])->name('store');
        Route::put('/{contactGroup}', [App\Http\Controllers\User\ContactGroupController::class, 'update'])->name('update');
        Route::delete('/{contactGroup}', [App\Http\Controllers\User\ContactGroupController::class, 'destroy'])->name('destroy');
        Route::post('/{contactGroup}/members', [App\Http\Controllers\User\ContactGroupController::class, 'addMembers'])->name('members.add');
        Route::delete('/{contactGroup}/members/{member}', [App\Http\Controllers\User\ContactGroupController::class, 'removeMember'])->name('members.remove');
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

    // Telegram Bot Management
    Route::prefix('telegram')->name('telegram.')->group(function () {
        // Bot management
        Route::get('/', [App\Http\Controllers\User\TelegramBotController::class, 'index'])->name('index');
        Route::post('/bots', [App\Http\Controllers\User\TelegramBotController::class, 'store'])->name('bots.store');

        // Session management (auto-create bot via Python service)
        Route::post('/session/send-code', [App\Http\Controllers\User\TelegramSessionController::class, 'sendCode'])->name('session.send-code');
        Route::post('/session/verify-code', [App\Http\Controllers\User\TelegramSessionController::class, 'verifyCode'])->name('session.verify-code');
        Route::post('/session/create-bot', [App\Http\Controllers\User\TelegramSessionController::class, 'createBot'])->name('session.create-bot');
        Route::get('/session/check', [App\Http\Controllers\User\TelegramSessionController::class, 'checkSession'])->name('session.check');
        Route::post('/session/logout', [App\Http\Controllers\User\TelegramSessionController::class, 'logout'])->name('session.logout');
        Route::post('/session/delete', [App\Http\Controllers\User\TelegramSessionController::class, 'deleteSession'])->name('session.delete');
        Route::post('/session/start-auto-reply', [App\Http\Controllers\User\TelegramSessionController::class, 'startAutoReply'])->name('session.start-auto-reply');
        Route::post('/session/stop-auto-reply', [App\Http\Controllers\User\TelegramSessionController::class, 'stopAutoReply'])->name('session.stop-auto-reply');
        Route::post('/bots/{telegramBot}/toggle-active', [App\Http\Controllers\User\TelegramBotController::class, 'toggleActive'])->name('bots.toggle-active');
        Route::post('/bots/{telegramBot}/toggle-auto-reply', [App\Http\Controllers\User\TelegramBotController::class, 'toggleAutoReply'])->name('bots.toggle-auto-reply');
        Route::post('/bots/{telegramBot}/toggle-ai', [App\Http\Controllers\User\TelegramBotController::class, 'toggleAI'])->name('bots.toggle-ai');
        Route::post('/bots/{telegramBot}/ai-settings', [App\Http\Controllers\User\TelegramBotController::class, 'updateAISettings'])->name('bots.ai-settings');
        Route::delete('/bots/{telegramBot}', [App\Http\Controllers\User\TelegramBotController::class, 'destroy'])->name('bots.destroy');
        Route::get('/bots/{telegramBot}/contacts', [App\Http\Controllers\User\TelegramBotController::class, 'contacts'])->name('bots.contacts');

        // Auto-reply management
        Route::get('/bots/{telegramBot}/auto-replies', [App\Http\Controllers\User\TelegramBotController::class, 'autoReplies'])->name('auto-replies.index');
        Route::post('/bots/{telegramBot}/auto-replies', [App\Http\Controllers\User\TelegramBotController::class, 'storeAutoReply'])->name('auto-replies.store');
        Route::put('/bots/{telegramBot}/auto-replies/{autoReply}', [App\Http\Controllers\User\TelegramBotController::class, 'updateAutoReply'])->name('auto-replies.update');
        Route::delete('/bots/{telegramBot}/auto-replies/{autoReply}', [App\Http\Controllers\User\TelegramBotController::class, 'destroyAutoReply'])->name('auto-replies.destroy');

        // Broadcast
        Route::get('/broadcast', [App\Http\Controllers\User\TelegramBroadcastController::class, 'index'])->name('broadcast.index');
        Route::get('/broadcast/contacts/{telegramBot}', [App\Http\Controllers\User\TelegramBroadcastController::class, 'getContacts'])->name('broadcast.contacts');
        Route::post('/broadcast/send', [App\Http\Controllers\User\TelegramBroadcastController::class, 'send'])->name('broadcast.send');
        Route::get('/broadcast/history', [App\Http\Controllers\User\TelegramBroadcastController::class, 'history'])->name('broadcast.history');
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

    // Email Broadcast
    Route::prefix('email-broadcast')->name('email-broadcast.')->group(function () {
        Route::get('/', [App\Http\Controllers\User\EmailBroadcastController::class, 'index'])->name('index');
        Route::post('/send', [App\Http\Controllers\User\EmailBroadcastController::class, 'send'])->name('send');
        Route::get('/history', [App\Http\Controllers\User\EmailBroadcastController::class, 'history'])->name('history');
        Route::get('/{broadcast}', [App\Http\Controllers\User\EmailBroadcastController::class, 'show'])->name('show');
    });

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
});

// Legacy dashboard route (redirect to new route)
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return redirect()->route('user.dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
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

    // Settings
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings');
    Route::put('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');

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
