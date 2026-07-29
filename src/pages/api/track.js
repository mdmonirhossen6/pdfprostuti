import { getDbCredentials } from '../../utils/db';
import {
  normalizeTrackPayload,
  insertEvent,
  downloadRowFromPayload,
  ctaRowFromPayload,
} from '../../utils/tracking';

export const prerender = false;

async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json();
  }
  // sendBeacon may post as text/plain
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function POST({ request, locals }) {
  try {
    const body = await readJson(request);
    const type = String(body.type || body.event || '').toLowerCase();
    if (type !== 'download' && type !== 'cta') {
      return new Response(JSON.stringify({ ok: false, message: 'Invalid event type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const runtime = locals?.runtime;
    const { dbUrl, dbWriteKey } = getDbCredentials(runtime);
    const payload = normalizeTrackPayload(body, request);

    if (!payload.resource_id && !payload.slug && !payload.destination_url) {
      return new Response(JSON.stringify({ ok: false, message: 'Missing resource identity' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const table = type === 'download' ? 'download_events' : 'cta_events';
    const row = type === 'download' ? downloadRowFromPayload(payload) : ctaRowFromPayload(payload);
    const result = await insertEvent(dbUrl, dbWriteKey, table, row);

    if (result.ok) {
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ ok: false, message: result.message || 'tracked' }), {
      status: result.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Track API error:', e);
    return new Response(JSON.stringify({ ok: false, message: 'Track failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
