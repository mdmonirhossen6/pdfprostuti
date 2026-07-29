import { getDbCredentials, getStorageBucket } from './db';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getExtension(fileName = '') {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : '';
}

function cleanFileName(fileName = '') {
  return fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'upload';
}

export async function uploadAsset({ runtime, file, folder, kind }) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Files must be 25 MB or smaller.');
  }

  const extension = getExtension(file.name);
  const isPdf = file.type === 'application/pdf' || extension === 'pdf';
  const isImage = file.type.startsWith('image/');

  if (kind === 'pdf' && !isPdf) {
    throw new Error('Please select a valid PDF file.');
  }
  if (kind === 'image' && !isImage) {
    throw new Error('Please select a valid image file.');
  }

  const { dbUrl, dbWriteKey } = getDbCredentials(runtime);
  if (!dbWriteKey || dbUrl.includes('your-supabase-project')) {
    throw new Error('Supabase storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const bucket = getStorageBucket(runtime);
  const objectName = `${folder}/${Date.now()}-${crypto.randomUUID()}-${cleanFileName(file.name)}${extension ? `.${extension}` : ''}`;
  const response = await fetch(`${dbUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectName}`, {
    method: 'POST',
    headers: {
      apikey: dbWriteKey,
      Authorization: `Bearer ${dbWriteKey}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.message || details.error || 'Storage upload failed. Make sure the bucket exists.');
  }

  return {
    url: `${dbUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectName}`,
    objectName,
  };
}
