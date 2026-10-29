<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostCategoryResource;
use App\Http\Resources\PostDetailResource;
use App\Http\Resources\PostSummaryResource;
use App\Models\Post;
use App\Models\PostCategory;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $posts = Post::query()
            ->published()
            ->with('category', 'author')
            ->filter($request->query())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate(QueryHelpers::perPage($request))
            ->withQueryString();

        return PostSummaryResource::collection($posts);
    }

    public function show(string $slug): PostDetailResource
    {
        $post = Post::query()->published()->with('category', 'author')->where('slug', $slug)->firstOrFail();

        $related = Post::query()->published()->with('category', 'author')
            ->whereKeyNot($post->id)
            ->orderByRaw('CASE WHEN post_category_id = ? THEN 0 ELSE 1 END', [$post->post_category_id])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        $post->setRelation('related', $related);

        return new PostDetailResource($post);
    }

    public function categories(Request $request): AnonymousResourceCollection
    {
        $query = PostCategory::query()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('name');

        if ($type = PostType::tryFrom((string) $request->query('type'))) {
            // A category with no type belongs to both sections.
            $query->where(fn ($q) => $q->where('type', $type->value)->orWhereNull('type'));
        }

        return PostCategoryResource::collection($query->get());
    }
}
