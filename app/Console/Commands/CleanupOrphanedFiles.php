<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanedFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:cleanup {--dry-run : Display files that would be deleted without actually deleting them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hapus file-file di storage yang tidak ada referensinya di database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('Running in DRY-RUN mode. No files will be deleted.');
        } else {
            if (!$this->confirm('PERINGATAN: Ini akan menghapus file yang tidak ada di database. Lanjutkan?')) {
                return;
            }
        }

        $this->info('Scanning storage files...');

        // Get all files from storage/app/public
        $allFiles = Storage::disk('public')->allFiles();
        $this->info('Found ' . count($allFiles) . ' files in storage.');

        // Collect all file references from database
        $referencedFiles = $this->collectReferencedFiles();
        $this->info('Found ' . count($referencedFiles) . ' file references in database.');

        // Find orphaned files
        $orphanedFiles = array_diff($allFiles, $referencedFiles);

        if (empty($orphanedFiles)) {
            $this->info('No orphaned files found. Storage is clean!');
            return;
        }

        $this->warn('Found ' . count($orphanedFiles) . ' orphaned files.');

        $totalSize = 0;
        foreach ($orphanedFiles as $file) {
            $size = Storage::disk('public')->size($file);
            $totalSize += $size;

            $this->line($file . ' (' . $this->formatBytes($size) . ')');

            if (!$dryRun) {
                Storage::disk('public')->delete($file);
            }
        }

        $this->info('');
        $this->info('Total space to be freed: ' . $this->formatBytes($totalSize));

        if ($dryRun) {
            $this->info('DRY-RUN completed. Run without --dry-run to actually delete files.');
        } else {
            $this->info('Cleanup completed! Deleted ' . count($orphanedFiles) . ' files.');
        }
    }

    /**
     * Collect all file references from database
     */
    private function collectReferencedFiles(): array
    {
        $files = [];

        // Users table (avatar)
        $files = array_merge($files, $this->getFilesFromColumn('users', 'avatar'));

        // Settings table (various image fields)
        $settingsColumns = [
            'logo', 'favicon', 'hero_image', 'contact_help_image', 'why_choose_image'
        ];
        foreach ($settingsColumns as $column) {
            $files = array_merge($files, $this->getFilesFromColumn('settings', $column));
        }

        // Posts table (featured_image)
        if ($this->tableExists('posts')) {
            $files = array_merge($files, $this->getFilesFromColumn('posts', 'featured_image'));
        }

        // Features table (image)
        if ($this->tableExists('features')) {
            $files = array_merge($files, $this->getFilesFromColumn('features', 'image'));
        }

        // Fitur Unggulans table (image)
        if ($this->tableExists('fitur_unggulans')) {
            $files = array_merge($files, $this->getFilesFromColumn('fitur_unggulans', 'image'));
        }

        // Testimonials table (image, avatar)
        if ($this->tableExists('testimonials')) {
            $files = array_merge($files, $this->getFilesFromColumn('testimonials', 'image'));
            $files = array_merge($files, $this->getFilesFromColumn('testimonials', 'avatar'));
        }

        // Banks table (logo)
        if ($this->tableExists('banks')) {
            $files = array_merge($files, $this->getFilesFromColumn('banks', 'logo'));
        }

        // Transactions table (payment_proof)
        if ($this->tableExists('transactions')) {
            $files = array_merge($files, $this->getFilesFromColumn('transactions', 'payment_proof'));
        }

        // About Pages table (image)
        if ($this->tableExists('about_pages')) {
            $files = array_merge($files, $this->getFilesFromColumn('about_pages', 'image'));
        }

        // WhatsApp Messages table (media files)
        if ($this->tableExists('whatsapp_messages')) {
            $files = array_merge($files, $this->getFilesFromColumn('whatsapp_messages', 'media_path'));
        }

        // Meta WhatsApp Messages table
        if ($this->tableExists('meta_whatsapp_messages')) {
            $files = array_merge($files, $this->getFilesFromColumn('meta_whatsapp_messages', 'media_url'));
        }

        // Meta Instagram Messages table
        if ($this->tableExists('meta_instagram_messages')) {
            $files = array_merge($files, $this->getFilesFromColumn('meta_instagram_messages', 'media_url'));
        }

        // Meta Facebook Messages table
        if ($this->tableExists('meta_facebook_messages')) {
            $files = array_merge($files, $this->getFilesFromColumn('meta_facebook_messages', 'media_url'));
        }

        return array_unique(array_filter($files));
    }

    /**
     * Get files from a specific table column
     */
    private function getFilesFromColumn(string $table, string $column): array
    {
        try {
            return DB::table($table)
                ->whereNotNull($column)
                ->where($column, '!=', '')
                ->pluck($column)
                ->map(function ($path) {
                    // Remove 'public/' prefix if exists
                    return str_replace('public/', '', $path);
                })
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Check if table exists
     */
    private function tableExists(string $table): bool
    {
        try {
            return DB::getSchemaBuilder()->hasTable($table);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Format bytes to human readable size
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
