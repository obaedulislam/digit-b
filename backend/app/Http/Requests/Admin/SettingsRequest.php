<?php

namespace App\Http\Requests\Admin;

/** Partial update: send any subset of the groups company, contact, social, stats, seo. */
class SettingsRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'company' => ['sometimes', 'array:name,tagline,description'],
            'company.name' => ['required_with:company', 'string', 'max:120'],
            'company.tagline' => ['nullable', 'string', 'max:255'],
            'company.description' => ['nullable', 'string', 'max:1000'],

            'contact' => ['sometimes', 'array:email,phone,address_lines,hours,map_url'],
            'contact.email' => ['required_with:contact', 'email:rfc', 'max:255'],
            'contact.phone' => ['nullable', 'string', 'max:40'],
            'contact.address_lines' => ['nullable', 'array', 'max:6'],
            'contact.address_lines.*' => ['string', 'max:255'],
            'contact.hours' => ['nullable', 'array', 'max:10'],
            'contact.hours.*.days' => ['required', 'string', 'max:60'],
            'contact.hours.*.time' => ['required', 'string', 'max:60'],
            'contact.map_url' => ['nullable', 'url:http,https', 'max:500'],

            'social' => ['sometimes', 'array:linkedin,facebook,x,instagram'],
            'social.linkedin' => ['nullable', 'url:http,https', 'max:255'],
            'social.facebook' => ['nullable', 'url:http,https', 'max:255'],
            'social.x' => ['nullable', 'url:http,https', 'max:255'],
            'social.instagram' => ['nullable', 'url:http,https', 'max:255'],

            'stats' => ['sometimes', 'array', 'max:8'],
            'stats.*.value' => ['required', 'string', 'max:40'],
            'stats.*.label' => ['required', 'string', 'max:120'],

            'seo' => ['sometimes', 'array:site_title,default_description,og_image'],
            'seo.site_title' => ['nullable', 'string', 'max:120'],
            'seo.default_description' => ['nullable', 'string', 'max:320'],
            'seo.og_image' => ['nullable', 'string', 'max:255'],
        ];
    }
}
