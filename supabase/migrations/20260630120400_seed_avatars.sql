-- Bolt 3 — minimal default avatar catalog so handle_new_user has assets to pick.
-- URLs point at the project's public `avatars` Storage bucket; upload the actual
-- images to avatars/defaults/ (or replace these URLs). Full team/match seed = Bolt 5.

insert into public.avatar_assets (key, url, sort_order) values
  ('default-01', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/01.png', 1),
  ('default-02', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/02.png', 2),
  ('default-03', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/03.png', 3),
  ('default-04', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/04.png', 4),
  ('default-05', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/05.png', 5),
  ('default-06', 'https://uyhymoykzwlovnqpzwnn.supabase.co/storage/v1/object/public/avatars/defaults/06.png', 6)
on conflict (key) do nothing;
