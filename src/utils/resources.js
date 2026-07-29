export const RESOURCE_TYPES = [
  { value: 'notes', label: 'নোট' },
  { value: 'suggestion', label: 'সাজেশন' },
  { value: 'question_paper', label: 'প্রশ্নপত্র' },
  { value: 'model_test', label: 'মডেল টেস্ট' },
  { value: 'syllabus', label: 'সিলেবাস' },
  { value: 'guide', label: 'গাইড' },
  { value: 'solution', label: 'সমাধান' },
  { value: 'other', label: 'অন্যান্য' },
];

export const LICENSE_OPTIONS = [
  { value: 'authorized', label: 'অনুমোদিত (Authorized)' },
  { value: 'own', label: 'নিজস্ব কনটেন্ট' },
  { value: 'partner', label: 'পার্টনারশিপ' },
  { value: 'public_domain', label: 'পাবলিক ডোমেইন' },
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'ড্রাফট' },
  { value: 'published', label: 'পাবলিশড' },
  { value: 'archived', label: 'আর্কাইভড' },
];

export const EXAM_CATEGORIES = ['HSC', 'Admission', 'BCS', 'SSC'];

export function resourceTypeLabel(value) {
  return RESOURCE_TYPES.find((item) => item.value === value)?.label || value || 'নোট';
}

export function statusToPublished(status) {
  return status === 'published';
}

export function publishedToStatus(isPublished) {
  return isPublished ? 'published' : 'draft';
}

export function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
