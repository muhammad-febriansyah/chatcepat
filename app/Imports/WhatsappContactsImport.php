<?php

namespace App\Imports;

use App\Models\WhatsappContact;
use App\Models\WhatsappSession;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

class WhatsappContactsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    use SkipsErrors, SkipsFailures;

    protected $userId;
    protected $sessionId;
    protected $importedCount = 0;
    protected $skippedCount = 0;

    public function __construct(int $userId, int $sessionId)
    {
        $this->userId = $userId;
        $this->sessionId = $sessionId;
    }

    public function model(array $row)
    {
        // Clean phone number - remove spaces, dashes, plus sign
        $phoneNumber = preg_replace('/[\s\-\+]/', '', $row['phone_number'] ?? $row['nomor_telepon'] ?? $row['no_telepon'] ?? $row['phone'] ?? '');

        // Skip if no phone number
        if (empty($phoneNumber)) {
            $this->skippedCount++;
            return null;
        }

        // Add country code if not present (assume Indonesia)
        if (substr($phoneNumber, 0, 1) === '0') {
            $phoneNumber = '62' . substr($phoneNumber, 1);
        }

        // Get display name from various possible column names
        $displayName = $row['display_name'] ?? $row['nama'] ?? $row['name'] ?? $row['nama_kontak'] ?? null;

        // Check if contact already exists
        $existing = WhatsappContact::where('user_id', $this->userId)
            ->where('whatsapp_session_id', $this->sessionId)
            ->where('phone_number', $phoneNumber)
            ->first();

        if ($existing) {
            // Update existing contact if name is provided
            if ($displayName && !$existing->display_name) {
                $existing->update(['display_name' => $displayName]);
            }
            $this->skippedCount++;
            return null;
        }

        $this->importedCount++;

        return new WhatsappContact([
            'user_id' => $this->userId,
            'whatsapp_session_id' => $this->sessionId,
            'phone_number' => $phoneNumber,
            'display_name' => $displayName,
            'push_name' => $row['push_name'] ?? null,
            'is_business' => $row['is_business'] ?? false,
            'is_group' => false,
            'metadata' => json_encode(['source' => 'excel_import']),
        ]);
    }

    public function rules(): array
    {
        return [
            // At least one of these columns should exist
            'phone_number' => 'nullable|string',
            'nomor_telepon' => 'nullable|string',
            'no_telepon' => 'nullable|string',
            'phone' => 'nullable|string',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }
}
