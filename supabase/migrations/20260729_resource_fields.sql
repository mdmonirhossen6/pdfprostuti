-- Resource-ready fields for posts (Prostuti BD PDF library)
-- Run in Supabase SQL editor if migrations are not applied via CLI.

alter table public.posts
  add column if not exists chapter text default '',
  add column if not exists resource_type text default 'notes',
  add column if not exists academic_year text default '',
  add column if not exists license text default 'authorized',
  add column if not exists source text default '',
  add column if not exists status text default 'published';

comment on column public.posts.chapter is 'Chapter or topic slug/label for hub pages';
comment on column public.posts.resource_type is 'PDF type: notes, suggestion, question_paper, model_test, syllabus, guide, solution, other';
comment on column public.posts.academic_year is 'Academic or exam year (e.g. 2026)';
comment on column public.posts.license is 'authorized | own | partner | public_domain';
comment on column public.posts.source is 'Attribution / source name or URL';
comment on column public.posts.status is 'draft | published | archived';

-- Keep existing rows consistent with is_published
update public.posts
set status = case
  when coalesce(is_published, false) then 'published'
  else 'draft'
end
where status is null or status = '';

create index if not exists posts_exam_subject_chapter_idx
  on public.posts (exam, subject, chapter);

create index if not exists posts_resource_type_idx
  on public.posts (resource_type);

create index if not exists posts_academic_year_idx
  on public.posts (academic_year);

create index if not exists posts_status_idx
  on public.posts (status);
