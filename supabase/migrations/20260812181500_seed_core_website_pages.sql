insert into public.website_pages (slug, path, title, draft_content, published_content)
values
  ('about', '/about', 'About', '{}'::jsonb, '{}'::jsonb),
  ('pricing', '/pricing', 'Pricing', '{}'::jsonb, '{}'::jsonb),
  ('how-it-works', '/how-it-works', 'How it works', '{}'::jsonb, '{}'::jsonb),
  ('quick-repair', '/quick-bike-repair-richmond', 'Quick repair', '{}'::jsonb, '{}'::jsonb),
  ('location', '/location', 'Location', '{}'::jsonb, '{}'::jsonb),
  ('faq', '/faq', 'FAQ', '{}'::jsonb, '{}'::jsonb)
on conflict (slug) do update
set path = excluded.path,
    title = excluded.title,
    updated_at = now();
