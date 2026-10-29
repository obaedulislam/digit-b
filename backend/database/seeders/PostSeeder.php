<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\PostType;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

/** The four legacy posts (original slugs, titles and categories) with complete original bodies. */
class PostSeeder extends Seeder
{
    public function run(): void
    {
        $news = PostCategory::query()->updateOrCreate(['slug' => 'latest-news'], ['name' => 'Latest News', 'type' => PostType::Article->value]);
        $blog = PostCategory::query()->updateOrCreate(['slug' => 'our-blog'], ['name' => 'Our Blog', 'type' => PostType::Blog->value]);

        foreach ($this->posts() as $post) {
            $category = $post['category'] === 'latest-news' ? $news : $blog;
            $daysAgo = $post['days_ago'];
            unset($post['category'], $post['days_ago']);

            $model = Post::query()->withTrashed()->firstOrNew(['slug' => $post['slug']]);
            $model->fill($post + [
                'post_category_id' => $category->id,
                'author_name' => 'DIGIT-B Editorial Team',
                'status' => ContentStatus::Published->value,
                'published_at' => $model->published_at ?? now()->subDays($daysAgo),
                // No stock photos ship with the launch content: the frontend renders generated
                // artwork when this is null. Editors can upload a real cover (and alt text) in the admin.
                'cover_image' => null,
                'seo_title' => $post['title'],
                'seo_description' => $post['excerpt'],
            ]);
            $model->save();
        }
    }

    /** @return list<array<string, mixed>> */
    private function posts(): array
    {
        return [
            [
                'slug' => 'why-hiring-great-tech-talent-is-harder-than-ever-and-what-actually-works',
                'title' => 'Why Hiring Great Tech Talent Is Harder Than Ever (and What Actually Works)',
                'type' => PostType::Article->value,
                'category' => 'latest-news',
                'days_ago' => 21,
                'cover_image_alt' => 'A hiring manager and a candidate in conversation across a table',
                'excerpt' => 'Candidates are selective, job boards underperform and relationships matter more than ever. Here is why tech hiring feels harder, and what actually works.',
                'body_markdown' => <<<'MD'
## The problem is not a shortage of people. It is how we reach them.

Ask almost any technology leader and you will hear the same story: roles that stay open for months, interview slots that go nowhere, and offers that are declined for reasons nobody saw coming. It is tempting to blame a talent shortage. In our experience the truth is more nuanced. Great people exist, but the traditional way of reaching them has stopped working.

### Strong candidates are selective

The engineers, data specialists and delivery leads you most want to hire are rarely unemployed. They have options, and they are quick to ignore anything that feels generic. A message that could have been sent to a thousand people is deleted in seconds. A message that shows you understand their work, their stack and what they might want next gets a reply.

This is especially true in retail supply chain technology, where the best people carry deep knowledge of inventory, fulfilment and store operations. They are not looking for "a developer role". They are looking for a specific problem worth their time.

### Job boards deliver volume, not fit

Posting a role and waiting for applications still has a place, but it increasingly produces a large pile of résumés and a very small number of qualified, interested people. Hiring teams spend hours sifting through applications that do not match, while the candidates they actually want never saw the advert in the first place.

Automated applicant filters make it worse. Strong candidates who describe their experience in different words than your job description can be rejected before a human ever reads their profile.

### Relationships beat transactions

The most reliable source of strong hires is still a trusted relationship. Candidates respond to people they know and organisations that treated them well in the past. A recruiter who has spoken with a specialist several times over several years can start a conversation that a job advert never could.

Referrals, community involvement and a reputation for a respectful hiring process all compound over time. They are slow to build and very hard to copy.

### What actually works

Based on the searches we run every week, the approaches that make a measurable difference are consistent:

1. **Be specific.** Describe the real problem, the team and the impact of the role. Specifics attract the right people and filter out the wrong ones.
2. **Move at the speed of the market.** Good candidates are typically in several processes at once. A week of silence is often the difference between a hire and a decline.
3. **Reach out personally.** Short, relevant, respectful messages to people who match the role outperform mass outreach by a wide margin.
4. **Make the process easy.** Fewer interview rounds, clear expectations and honest feedback leave candidates with a positive impression, whatever the outcome.
5. **Use specialists.** A recruiter who works in your field already knows who is good, who is available and what motivates them.

### A different way to think about hiring

Hiring is not an administrative task to be completed as quickly as possible. It is a conversation with people who have choices. The organisations that treat it that way, with respect, clarity and a bit of patience, consistently build stronger teams.

At DIGIT-B we spend our days having those conversations on behalf of retailers, logistics providers and the technology companies that serve them. If your open roles are taking longer than they should, we would be glad to talk through what is getting in the way.
MD,
            ],
            [
                'slug' => 'what-tech-candidates-really-look-for-in-2025-hint-its-not-just-salary',
                'title' => "What Tech Candidates Really Look for in 2025 (Hint: It's Not Just Salary)",
                'type' => PostType::Article->value,
                'category' => 'latest-news',
                'days_ago' => 35,
                'cover_image_alt' => 'A software engineer working at a laptop in a bright office',
                'excerpt' => 'Compensation still matters, but meaningful work, flexibility, growth, a respectful hiring process and being listened to decide who accepts your offer.',
                'body_markdown' => <<<'MD'
## Pay gets attention. These five things win the decision.

Every year we speak with hundreds of technology professionals about what would make them change jobs, and every year compensation lands in the top few answers. But it is rarely the answer that decides. When two offers are within a few percent of each other, and often when they are not, candidates choose based on how a role and a company make them feel about the next few years of their working life.

Here is what we hear most often in 2025.

### 1. Meaningful work

People want to know that what they build matters. In retail supply chain technology this is surprisingly easy to show: a better inventory model means fewer empty shelves; a faster fulfilment service means a parcel arrives before a birthday. Candidates respond when a hiring manager can explain, specifically, who benefits from the work and how.

If your role description lists tools and responsibilities but never mentions the outcome, you are leaving your strongest argument unused.

### 2. Flexibility

Flexibility is no longer a perk. It is a baseline expectation. That does not always mean fully remote. Many candidates are happy to come into an office a few days a week, as long as the rules are clear and applied consistently. What frustrates them is ambiguity and policies that change without explanation.

Be explicit about location, hours and travel from the first conversation. Candidates who can plan their lives around a role are far more likely to commit to it.

### 3. Growth and mentorship

Technologists are acutely aware that skills age quickly. They look for employers that will help them grow: access to senior colleagues, time for learning, a clear path to the next level and the chance to work on harder problems.

Mentorship is particularly valued by people early in their careers or switching into the industry. A named mentor and a structured plan can outweigh a modest salary difference.

### 4. A hiring experience that respects them

Candidates remember how they were treated. Long silences, repeated interviews that cover the same ground, vague feedback and last-minute cancellations are shared with friends and colleagues, and they influence who applies next time.

The reverse is also true. A clear timeline, interviewers who have read the résumé, prompt decisions and honest feedback leave a lasting positive impression, even for people who do not get the job.

### 5. Being listened to

This one is subtle but powerful. Candidates notice whether interviewers ask questions and then listen, whether their concerns are taken seriously and whether the conversation is two-way. Feeling heard during the process is a strong predictor of how they expect to be treated as an employee.

Give candidates room to ask about the team, the roadmap and the challenges. Answer candidly, including about what is not perfect.

### What this means for employers

None of these factors cost much. They require clarity, speed and a genuine interest in the person across the table. Companies that get them right tend to win candidates against better-paying competitors, and they keep them longer.

Salary still matters, and you should pay fairly for the market. But treat it as the entry ticket, not the whole story. If you would like help understanding how your offer and your process look from the candidate's side, our consultation service is built for exactly that.
MD,
            ],
            [
                'slug' => 'why-specialized-tech-recruiters-make-a-real-difference',
                'title' => 'Why Specialized Tech Recruiters Make a Real Difference',
                'type' => PostType::Article->value,
                'category' => 'latest-news',
                'days_ago' => 49,
                'cover_image_alt' => 'Two colleagues reviewing a hiring plan on a whiteboard',
                'excerpt' => 'A recruiter who understands your technology and your market brings shared understanding, efficiency, lasting placements and a stronger team.',
                'body_markdown' => <<<'MD'
## Generalist recruiting works until the role gets technical

Plenty of recruitment firms can fill a role. Fewer can fill a hard-to-define, technically demanding role with a person who is still thriving two years later. The difference is rarely effort. It is understanding.

Here is where a specialist makes a real difference.

### Shared understanding

When a hiring manager says they need "someone who has worked with event-driven order management" or "an engineer who understands slotting and wave planning", a generalist has to translate those words into search terms and hope. A specialist already knows what they mean, which companies do it well and which adjacent experiences transfer.

This shared language speeds up the intake conversation and prevents the most common failure in recruitment: a polished shortlist of people who are not quite right.

### Efficiency through pre-vetting

A specialist can tell, within a few minutes, whether a candidate genuinely has the experience on their résumé. They ask the right follow-up questions, spot vague answers and recognise genuine depth. By the time a shortlist reaches you, the obvious mismatches have been removed.

That saves your engineers hours of interview time and protects them from the frustration of speaking to people who are clearly not suited. For small teams, those hours are precious.

### Placements that last

A quick placement that ends in six months is an expensive outcome for everyone. Specialists tend to produce longer-lasting results for two reasons. First, they understand the realistic demands of the work, so candidates know what they are signing up for. Second, they care about their reputation within a small industry. A poor match is remembered by both clients and candidates.

Good specialists also help candidates decide whether to say no. Sometimes the right advice is "this role is not for you", and that honesty builds trust that pays off for years.

### Building teams, not just filling seats

A specialist looks beyond a single vacancy. They notice that your team is strong on back-end services but thin on test automation, or that your next three hires should include someone who can mentor junior colleagues. They can advise on sequence, balance and the realistic market for each profile.

Over time, they become familiar with your culture and your technical direction, and they begin to bring you candidates you did not know to ask for.

### When a specialist is the right choice

A specialist is worth the investment when:

- The role requires domain knowledge that takes years to build
- The talent pool is small and mostly passive
- A bad hire would be costly in time, quality or team morale
- You want a long-term partner, not a one-off transaction

### Our approach

At DIGIT-B we focus on retail supply chain technology because we believe depth beats breadth. Our recruiters learn your systems, your customers and your culture, and they stay close to the market every day. If you are weighing up how to staff your next critical hire, we would be happy to share what we are seeing and how we would approach it.
MD,
            ],
            [
                'slug' => 'common-hiring-mistakes-tech-companies-dont-realize-theyre-making',
                'title' => "Common Hiring Mistakes Tech Companies Don't Realize They're Making",
                'type' => PostType::Blog->value,
                'category' => 'our-blog',
                'days_ago' => 63,
                'cover_image_alt' => 'An empty interview room with two chairs and a table',
                'excerpt' => 'Asking for too much, deciding too slowly, ignoring candidate experience and bringing in a recruiting partner too late: four mistakes that quietly cost you great hires.',
                'body_markdown' => <<<'MD'
## Four mistakes that quietly cost you great hires

Most hiring problems are not caused by bad intentions. They come from habits that feel reasonable from the inside and look very different from a candidate's point of view. These are the four we see most often.

### 1. Asking for too much

The "unicorn" job description is a classic: ten years of experience in a technology that has existed for six, expertise in three programming languages, leadership experience, a degree, and a willingness to wear many hats. Almost nobody matches every line, and the people who do are usually not available.

Long lists of requirements also discourage strong candidates from applying. Research on hiring consistently shows that many qualified people, particularly women and career switchers, rule themselves out when they cannot tick every box.

**What to do instead:** Separate what is essential from what is nice to have. Aim for a handful of must-haves that really determine success, and describe the rest as bonus skills. Be willing to train for gaps that are easy to close.

### 2. Making slow decisions

Good candidates rarely have a single process running. If your interview loop takes four weeks, and a competitor's takes ten days, the competitor will often win, however much you offer.

Delays usually come from calendars, committee decisions and waiting for "one more opinion". Each pause signals indifference to the candidate and gives other employers time to move.

**What to do instead:** Agree the interview stages and decision-makers before the search starts. Hold feedback sessions within 24 hours of each interview. Give candidates a clear timeline and keep to it.

### 3. Ignoring candidate experience

Candidates talk. A confusing application form, interviewers who have not read the résumé, ghosting after a final round, or a rejection that arrives six weeks late leaves a lasting impression. In a small industry such as retail supply chain technology, that impression travels quickly.

It also affects conversion. People who feel respected are more likely to accept an offer, to refer friends and to reapply in the future.

**What to do instead:** Treat the process as part of your employer brand. Brief interviewers, communicate promptly, provide meaningful feedback and thank every candidate for their time, including those you decline.

### 4. Not partnering early

Many companies bring in a recruiting partner only after an internal search has stalled for two or three months. By then the role has been advertised widely, the best candidates have been approached by others, and the hiring team is under pressure.

An early conversation with a specialist can save months. They can sense-check the job description, indicate realistic salary expectations and identify whether the profile exists in the market at all.

**What to do instead:** Involve your recruiting partner at the planning stage, before the role is advertised. Share the business context, the constraints and your real priorities.

## Conclusion

Hiring well does not require a bigger budget so much as a clearer approach. Be realistic about what you ask for, decide quickly, treat every candidate with respect and bring in help early. These are small changes with an outsized effect.

If you recognise one or more of these patterns in your own process, you are in good company. We help teams find and fix them every week. Get in touch and we will gladly take a fresh look at your next search with you.
MD,
            ],
        ];
    }
}
