<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePricingPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $packageId = $this->route('pricing_package');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:pricing_packages,slug,' . $packageId],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'in:IDR,USD'],
            'period' => ['required', 'integer', 'min:1'],
            'period_unit' => ['required', 'string', 'in:month,year'],
            'features' => ['required', 'array', 'min:1'],
            'features.*' => ['required', 'string'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
            'button_text' => ['nullable', 'string', 'max:255'],
            'button_url' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama paket',
            'slug' => 'slug',
            'description' => 'deskripsi',
            'price' => 'harga',
            'currency' => 'mata uang',
            'period' => 'periode',
            'period_unit' => 'satuan periode',
            'features' => 'fitur',
            'is_featured' => 'unggulan',
            'is_active' => 'status aktif',
            'order' => 'urutan',
            'button_text' => 'teks tombol',
            'button_url' => 'URL tombol',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama paket wajib diisi.',
            'name.max' => 'Nama paket maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah digunakan.',
            'description.required' => 'Deskripsi wajib diisi.',
            'price.required' => 'Harga wajib diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga minimal 0.',
            'currency.required' => 'Mata uang wajib dipilih.',
            'currency.in' => 'Mata uang tidak valid.',
            'period.required' => 'Periode wajib diisi.',
            'period.integer' => 'Periode harus berupa angka bulat.',
            'period.min' => 'Periode minimal 1.',
            'period_unit.required' => 'Satuan periode wajib dipilih.',
            'period_unit.in' => 'Satuan periode tidak valid.',
            'features.required' => 'Fitur wajib diisi.',
            'features.array' => 'Fitur harus berupa array.',
            'features.min' => 'Minimal harus ada 1 fitur.',
            'features.*.required' => 'Setiap fitur wajib diisi.',
        ];
    }
}
