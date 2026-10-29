<?php

namespace App\Http\Resources\Admin;

use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ContactInquiry */
class InquiryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company,
            'inquiry_type' => $this->inquiry_type->value,
            'subject' => $this->subject,
            'message' => $this->message,
            'status' => $this->status->value,
            'notes' => $this->notes,
            'consented_at' => $this->consented_at?->toIso8601ZuluString(),
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
