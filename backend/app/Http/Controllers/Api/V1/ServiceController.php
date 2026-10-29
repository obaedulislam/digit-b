<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ServiceGroup;
use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceDetailResource;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Service::query()->published()->ordered();

        if ($group = ServiceGroup::tryFrom((string) $request->query('group'))) {
            $query->where('group', $group->value);
        }

        return ServiceResource::collection($query->get());
    }

    public function show(string $slug): ServiceDetailResource
    {
        return new ServiceDetailResource(Service::query()->published()->where('slug', $slug)->firstOrFail());
    }
}
