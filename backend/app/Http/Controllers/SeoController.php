<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use App\Models\Post;
use App\Models\Service;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /** Static frontend routes: path => [changefreq, priority]. */
    private const STATIC_ROUTES = [
        '/' => ['weekly', '1.0'],
        '/about' => ['monthly', '0.7'],
        '/services' => ['monthly', '0.8'],
        '/vacancies' => ['daily', '0.9'],
        '/apply' => ['monthly', '0.7'],
        '/articles' => ['weekly', '0.7'],
        '/blog' => ['weekly', '0.7'],
        '/mentorship' => ['monthly', '0.7'],
        '/contact' => ['monthly', '0.7'],
    ];

    public function sitemap(): Response
    {
        $base = config('digitb.frontend_url');
        $entries = [];

        foreach (self::STATIC_ROUTES as $path => [$freq, $priority]) {
            $entries[] = [$base.($path === '/' ? '/' : $path), null, $freq, $priority];
        }

        foreach (Service::query()->published()->ordered()->get(['slug', 'updated_at']) as $service) {
            $entries[] = [$base.'/services/'.$service->slug, $service->updated_at, 'monthly', '0.7'];
        }

        foreach (JobPosting::query()->open()->orderByDesc('published_at')->get(['slug', 'updated_at']) as $job) {
            $entries[] = [$base.'/vacancies/'.$job->slug, $job->updated_at, 'weekly', '0.8'];
        }

        foreach (Post::query()->published()->orderByDesc('published_at')->get(['slug', 'type', 'updated_at']) as $post) {
            $entries[] = [
                $base.($post->type->value === 'blog' ? '/blog/' : '/articles/').$post->slug,
                $post->updated_at, 'monthly', '0.6',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($entries as [$loc, $lastmod, $freq, $priority]) {
            $xml .= "  <url>\n    <loc>".htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8')."</loc>\n";
            if ($lastmod) {
                $xml .= '    <lastmod>'.$lastmod->toIso8601String()."</lastmod>\n";
            }
            $xml .= "    <changefreq>{$freq}</changefreq>\n    <priority>{$priority}</priority>\n  </url>\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots(): Response
    {
        $base = config('digitb.frontend_url');

        $body = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api/',
            '',
            'Sitemap: '.$base.'/sitemap.xml',
            '',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
