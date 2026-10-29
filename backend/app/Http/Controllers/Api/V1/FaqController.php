<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\FaqGroup;
use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FaqController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Faq::query()->published()->ordered();

        if ($group = FaqGroup::tryFrom((string) $request->query('group'))) {
            $query->where('group', $group->value);
        }

        return FaqResource::collection($query->get());
    }
}
