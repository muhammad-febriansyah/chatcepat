<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guide_articles', function (Blueprint $table) {
            $table->string('platform')->nullable()->after('guide_category_id');
            $table->string('video_url')->nullable()->after('content');
            $table->string('icon')->nullable()->after('video_url');
        });

        // Migrate data from meta_documentations to guide_articles
        if (Schema::hasTable('meta_documentations')) {
            // Create a new category for Meta Documentation if it doesn't exist
            $categoryId = DB::table('guide_categories')->insertGetId([
                'name' => 'Integrasi Meta',
                'slug' => 'integrasi-meta',
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $metaDocs = DB::table('meta_documentations')->get();

            foreach ($metaDocs as $doc) {
                DB::table('guide_articles')->insert([
                    'guide_category_id' => $categoryId,
                    'platform' => $doc->platform,
                    'title' => $doc->title,
                    'slug' => $doc->slug,
                    'content' => $doc->content,
                    'video_url' => $doc->video_url,
                    'icon' => $doc->icon,
                    'sort_order' => $doc->order,
                    'is_published' => $doc->is_active,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guide_articles', function (Blueprint $table) {
            $table->dropColumn(['platform', 'video_url', 'icon']);
        });

        // Optional: Remove the category and articles created during up()
        $category = DB::table('guide_categories')->where('slug', 'integrasi-meta')->first();
        if ($category) {
            DB::table('guide_articles')->where('guide_category_id', $category->id)->delete();
            DB::table('guide_categories')->where('id', $category->id)->delete();
        }
    }
};
