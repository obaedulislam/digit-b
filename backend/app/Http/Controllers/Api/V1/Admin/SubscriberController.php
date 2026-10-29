<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\SubscriberResource;
use App\Models\NewsletterSubscriber;
use App\Support\CsvExport;
use App\Support\QueryHelpers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubscriberController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $this->query($request);
        QueryHelpers::sort($query, $request->query('sort'), ['id', 'email', 'subscribed_at', 'created_at'], '-id');

        return SubscriberResource::collection($query->paginate(QueryHelpers::perPage($request))->withQueryString());
    }

    public function destroy(string $id): Response
    {
        NewsletterSubscriber::query()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function export(Request $request): StreamedResponse
    {
        return CsvExport::stream(
            'subscribers-'.now()->format('Ymd-His').'.csv',
            // "Unsubscribe URL" is the merge field for an external mailing tool, so every
            // campaign can carry a working one-click unsubscribe link.
            ['ID', 'Email', 'Status', 'Subscribed at', 'Unsubscribed at', 'Unsubscribe URL'],
            $this->query($request)->orderBy('id'),
            fn (NewsletterSubscriber $s) => [
                $s->id,
                $s->email,
                $s->unsubscribed_at ? 'unsubscribed' : 'active',
                $s->subscribed_at?->toIso8601String(),
                $s->unsubscribed_at?->toIso8601String(),
                $s->unsubscribeUrl(),
            ],
        );
    }

    private function query(Request $request): Builder
    {
        $query = NewsletterSubscriber::query();
        QueryHelpers::search($query, $request->query('search'), ['email']);

        match ($request->query('status')) {
            'active' => $query->whereNull('unsubscribed_at'),
            'unsubscribed' => $query->whereNotNull('unsubscribed_at'),
            default => null,
        };

        return $query;
    }
}
