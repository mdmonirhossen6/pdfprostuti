/** Production app CTA domain — only destination for contextual CTAs. */
export const APP_CTA_ORIGIN = 'https://web.prostuti.bd';

/**
 * Contextual destination path by exam category.
 * HSC → practice, Admission → model test, BCS → question bank.
 */
export function getContextualCtaPath({ exam, subject, chapter } = {}) {
  const examKey = (exam || 'HSC').toString().trim().toUpperCase();
  const subjectSlug = (subject || '').toString().trim().toLowerCase() || 'general';
  const chapterSlug = (chapter || '').toString().trim().toLowerCase();

  let basePath;
  switch (examKey) {
    case 'ADMISSION':
      basePath = `/model-test/${subjectSlug}`;
      break;
    case 'BCS':
      basePath = `/question-bank/${subjectSlug}`;
      break;
    case 'SSC':
    case 'HSC':
    default:
      basePath = `/practice/${subjectSlug}`;
      break;
  }

  if (chapterSlug) {
    return `${basePath}/${chapterSlug}`;
  }
  return basePath;
}

export function buildUtmParams({
  exam,
  subject,
  slug,
  resourceId,
  medium = 'pdf',
  contentPlacement = 'resource',
} = {}) {
  const campaign = (exam || 'general').toString().trim().toLowerCase() || 'general';
  const content =
    slug ||
    resourceId ||
    [exam, subject].filter(Boolean).join('-').toLowerCase() ||
    'resource';

  return {
    utm_source: 'prostutibd',
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: `${contentPlacement}-${content}`,
  };
}

/**
 * Build a full CTA URL with UTM tags.
 * If customAppLink is set and already absolute, merge UTMs onto it.
 * Otherwise build contextual path under APP_CTA_ORIGIN.
 */
export function buildAppCtaUrl({
  exam,
  subject,
  chapter,
  slug,
  resourceId,
  customAppLink,
  appOrigin = APP_CTA_ORIGIN,
  medium = 'pdf',
  contentPlacement = 'resource',
} = {}) {
  const utm = buildUtmParams({
    exam,
    subject,
    slug,
    resourceId,
    medium,
    contentPlacement,
  });

  let url;
  const custom = (customAppLink || '').trim();
  if (custom) {
    try {
      url = new URL(custom);
    } catch {
      url = new URL(getContextualCtaPath({ exam, subject, chapter }), appOrigin);
    }
  } else {
    url = new URL(getContextualCtaPath({ exam, subject, chapter }), appOrigin);
  }

  Object.entries(utm).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}

export function defaultAppOrigin() {
  return APP_CTA_ORIGIN;
}
