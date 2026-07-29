const MAX_TEXT = 500;
const MAX_UA = 400;
const MAX_URL = 1000;

export function detectDeviceFromUa(ua = '') {
  const value = ua.toLowerCase();
  if (!value) return 'unknown';
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function hostFromReferral(referral = '') {
  try {
    if (!referral) return '';
    return new URL(referral).host || '';
  } catch {
    return '';
  }
}

export function parseUtmFromUrl(destinationUrl = '') {
  try {
    const url = new URL(destinationUrl);
    return {
      utm_source: url.searchParams.get('utm_source') || '',
      utm_medium: url.searchParams.get('utm_medium') || '',
      utm_campaign: url.searchParams.get('utm_campaign') || '',
      utm_content: url.searchParams.get('utm_content') || '',
    };
  } catch {
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
    };
  }
}

function clip(value, max = MAX_TEXT) {
  return String(value ?? '').trim().slice(0, max);
}

export function normalizeTrackPayload(body = {}, request) {
  const ua = clip(request?.headers?.get?.('user-agent') || body.user_agent || '', MAX_UA);
  const referral = clip(body.referral || request?.headers?.get?.('referer') || '', MAX_URL);
  const destinationUrl = clip(body.destination_url || body.destinationUrl || '', MAX_URL);
  const utm = parseUtmFromUrl(destinationUrl);

  return {
    resource_id: clip(body.resource_id || body.resourceId || '', 120),
    exam: clip(body.exam || '', 40),
    subject: clip(body.subject || '', 80),
    chapter: clip(body.chapter || '', 80),
    slug: clip(body.slug || '', 160),
    link_kind: clip(body.link_kind || body.linkKind || 'primary', 40),
    placement: clip(body.placement || 'resource', 60),
    device: clip(body.device || detectDeviceFromUa(ua), 40),
    referral,
    referrer_host: clip(hostFromReferral(referral), 160),
    user_agent: ua,
    destination_url: destinationUrl,
    page_path: clip(body.page_path || body.pagePath || '', 300),
    utm_source: clip(body.utm_source || utm.utm_source, 80),
    utm_medium: clip(body.utm_medium || utm.utm_medium, 80),
    utm_campaign: clip(body.utm_campaign || utm.utm_campaign, 80),
    utm_content: clip(body.utm_content || utm.utm_content, 160),
  };
}

export async function insertEvent(dbUrl, dbWriteKey, table, row) {
  if (!dbUrl || !dbWriteKey) {
    return { ok: false, status: 500, message: 'Missing Supabase credentials' };
  }

  const res = await fetch(`${dbUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: dbWriteKey,
      Authorization: `Bearer ${dbWriteKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      ok: false,
      status: res.status,
      message: err.message || `Failed to insert into ${table}`,
    };
  }

  return { ok: true, status: 204 };
}

export function downloadRowFromPayload(payload) {
  return {
    resource_id: payload.resource_id || null,
    exam: payload.exam,
    subject: payload.subject,
    chapter: payload.chapter,
    slug: payload.slug,
    link_kind: payload.link_kind,
    device: payload.device,
    referral: payload.referral,
    referrer_host: payload.referrer_host,
    user_agent: payload.user_agent,
    destination_url: payload.destination_url,
    page_path: payload.page_path,
  };
}

export function ctaRowFromPayload(payload) {
  return {
    resource_id: payload.resource_id || null,
    exam: payload.exam,
    subject: payload.subject,
    chapter: payload.chapter,
    slug: payload.slug,
    placement: payload.placement,
    device: payload.device,
    referral: payload.referral,
    referrer_host: payload.referrer_host,
    user_agent: payload.user_agent,
    destination_url: payload.destination_url,
    page_path: payload.page_path,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
  };
}

export function countBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'unknown';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}
