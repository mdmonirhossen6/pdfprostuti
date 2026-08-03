import { EXAM_CATEGORIES } from './resources.js';

export const SITE_ORIGIN = 'https://prostutibd.app';

export const EXAM_META = {
  hsc: {
    key: 'HSC',
    labelBn: 'এইচএসসি',
    headline: 'HSC PDF লাইব্রেরি',
    description:
      'এইচএসসি পরীক্ষার নোট, সাজেশন, প্রশ্নপত্র ও মডেল টেস্ট PDF বিনামূল্যে ডাউনলোড করুন। বিষয় ও অধ্যায় অনুযায়ী খুঁজুন।',
  },
  admission: {
    key: 'Admission',
    labelBn: 'অ্যাডমিশন',
    headline: 'Admission PDF লাইব্রেরি',
    description:
      'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার নোট, মডেল টেস্ট ও প্রশ্নব্যাংক PDF—বিষয়ভিত্তিক সংগ্রহ।',
  },
  bcs: {
    key: 'BCS',
    labelBn: 'বিসিএস',
    headline: 'BCS PDF লাইব্রেরি',
    description:
      'বিসিএস প্রিলি ও লিখিত প্রস্তুতির নোট, প্রশ্নব্যাংক ও মডেল টেস্ট PDF এক জায়গায়।',
  },
  ssc: {
    key: 'SSC',
    labelBn: 'এসএসসি',
    headline: 'SSC PDF লাইব্রেরি',
    description:
      'এসএসসি পরীক্ষার সাজেশন, নোট ও মডেল টেস্ট PDF বিষয় ও অধ্যায় অনুযায়ী ডাউনলোড করুন।',
  },
};

export function resolveExam(examParam) {
  const slug = (examParam || '').toString().trim().toLowerCase();
  return EXAM_META[slug] || null;
}

export function examPath(examKeyOrSlug) {
  return `/${String(examKeyOrSlug).toLowerCase()}`;
}

export function subjectPath(exam, subject) {
  return `${examPath(exam)}/${String(subject || '').toLowerCase()}`;
}

export function chapterPath(exam, subject, chapter) {
  return `${subjectPath(exam, subject)}/chapter/${String(chapter || '').toLowerCase()}`;
}

export function resourcePath(exam, subject, slug) {
  return `${subjectPath(exam, subject)}/${slug}`;
}

export async function fetchPublishedPosts(dbUrl, dbReadKey, { exam, subject, chapter, select } = {}) {
  const fields =
    select ||
    'id,title,slug,exam,subject,chapter,resource_type,academic_year,image_url,image_alt,content,created_at,updated_at,source';
  const params = new URLSearchParams({
    select: fields,
    is_published: 'eq.true',
    order: 'created_at.desc',
    limit: '1000',
  });

  if (exam) params.set('exam', `ilike.${exam}`);
  if (subject) params.set('subject', `ilike.${subject}`);
  if (chapter) params.set('chapter', `ilike.${chapter}`);

  const res = await fetch(`${dbUrl}/rest/v1/posts?${params.toString()}`, {
    headers: { apikey: dbReadKey, Authorization: `Bearer ${dbReadKey}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), 'en'),
  );
}

export function groupBySubject(posts) {
  const map = new Map();
  for (const post of posts) {
    const key = (post.subject || 'general').toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(post);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subject, items]) => ({ subject, count: items.length, posts: items }));
}

export function groupByChapter(posts) {
  const map = new Map();
  for (const post of posts) {
    const key = (post.chapter || '').trim().toLowerCase();
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(post);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chapter, items]) => ({ chapter, count: items.length, posts: items }));
}

export function relatedPosts(posts, current, limit = 6) {
  if (!current) return [];
  const currentId = current.id;
  const subject = (current.subject || '').toLowerCase();
  const chapter = (current.chapter || '').toLowerCase();
  const exam = (current.exam || '').toUpperCase();

  const scored = posts
    .filter((p) => p.id !== currentId && (p.exam || '').toUpperCase() === exam)
    .map((p) => {
      let score = 0;
      if ((p.subject || '').toLowerCase() === subject) score += 3;
      if (chapter && (p.chapter || '').toLowerCase() === chapter) score += 2;
      if (p.resource_type && p.resource_type === current.resource_type) score += 1;
      return { post: p, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.created_at) - new Date(a.post.created_at));

  return scored.slice(0, limit).map((item) => item.post);
}

export function displayLabel(value) {
  if (!value) return '';
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function allExamSlugs() {
  return EXAM_CATEGORIES.map((c) => c.toLowerCase());
}
