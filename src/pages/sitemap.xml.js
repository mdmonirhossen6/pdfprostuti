// filepath: src/pages/sitemap.xml.js
import { getDbCredentials } from '../utils/db';
import { EXAM_META, subjectPath, chapterPath, SITE_ORIGIN } from '../utils/hubs';

export async function GET({ locals }) {
  const runtime = locals.runtime;
  const { dbUrl, dbReadKey } = getDbCredentials(runtime);

  let posts = [];
  try {
    const res = await fetch(
      `${dbUrl}/rest/v1/posts?select=slug,exam,subject,chapter,updated_at&is_published=eq.true`,
      {
        headers: { apikey: dbReadKey, Authorization: `Bearer ${dbReadKey}` },
      },
    );
    if (res.ok) {
      posts = await res.json();
    }
  } catch (e) {
    console.error('Error generating sitemap:', e);
  }

  if (!posts || posts.length === 0) {
    posts = [
      {
        slug: 'physics-1st-paper-suggestion',
        exam: 'HSC',
        subject: 'physics',
        chapter: 'motion',
        updated_at: new Date().toISOString(),
      },
      {
        slug: 'bcs-46-bangla-literature',
        exam: 'BCS',
        subject: 'bangla',
        chapter: 'literature',
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const subjectKeys = new Set();
  const chapterKeys = new Set();
  for (const post of posts) {
    if (post.exam && post.subject) {
      subjectKeys.add(`${post.exam}|${post.subject}`.toLowerCase());
    }
    if (post.exam && post.subject && post.chapter) {
      chapterKeys.add(`${post.exam}|${post.subject}|${post.chapter}`.toLowerCase());
    }
  }

  const staticPages = [
    { loc: `${SITE_ORIGIN}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/terms`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE_ORIGIN}/privacy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE_ORIGIN}/content-policy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE_ORIGIN}/report`, changefreq: 'yearly', priority: '0.3' },
    ...Object.keys(EXAM_META).map((slug) => ({
      loc: `${SITE_ORIGIN}/${slug}`,
      changefreq: 'daily',
      priority: '0.9',
    })),
  ];

  const subjectUrls = [...subjectKeys].map((key) => {
    const [exam, subject] = key.split('|');
    return {
      loc: `${SITE_ORIGIN}${subjectPath(exam, subject)}`,
      changefreq: 'daily',
      priority: '0.85',
    };
  });

  const chapterUrls = [...chapterKeys].map((key) => {
    const [exam, subject, chapter] = key.split('|');
    return {
      loc: `${SITE_ORIGIN}${chapterPath(exam, subject, chapter)}`,
      changefreq: 'weekly',
      priority: '0.75',
    };
  });

  const resourceUrls = posts.map((post) => ({
    loc: `${SITE_ORIGIN}/${post.exam.toLowerCase()}/${post.subject.toLowerCase()}/${post.slug}`,
    lastmod: new Date(post.updated_at || Date.now()).toISOString(),
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const urls = [...staticPages, ...subjectUrls, ...chapterUrls, ...resourceUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
