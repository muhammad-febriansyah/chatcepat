<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MetaContactGroup extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'name',
        'description',
        'color',
        'contacts_count',
    ];

    protected $casts = [
        'contacts_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(
            MetaContact::class,
            'meta_contact_group_members',
            'group_id',
            'contact_id'
        )->withTimestamps();
    }

    /**
     * Update contacts count
     */
    public function updateContactsCount(): void
    {
        $this->update(['contacts_count' => $this->contacts()->count()]);
    }
}
