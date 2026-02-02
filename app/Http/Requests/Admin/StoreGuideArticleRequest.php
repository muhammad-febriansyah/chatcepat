<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuideArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guide_category_id' => ['required', 'exists:guide_categories,id'],
            'platform' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255', 'unique:guide_articles,title'],
            'content' => ['required', 'string'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'featured_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'sort_order' => ['integer', 'min:0'],
            'is_published' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'guide_category_id.required' => 'Kategori wajib dipilih.',
            'guide_category_id.exists' => 'Kategori tidak valid.',
            'title.required' => 'Judul artikel wajib diisi.',
            'title.max' => 'Judul artikel maksimal 255 karakter.',
            'title.unique' => 'Judul artikel sudah ada.',
            'content.required' => 'Konten artikel wajib diisi.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
        ];
    }
}
