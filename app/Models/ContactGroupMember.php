<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactGroupMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_group_id',
        'phone_number',
        'name',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ContactGroup::class, 'contact_group_id');
    }
}
