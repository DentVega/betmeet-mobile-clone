-- Bolt V8 — avatars Storage bucket + owner-folder RLS (ADR-023).
-- Guarded: no-op where the storage schema is absent (ephemeral PG test); applies on remote.

do $$
begin
  if not exists (
    select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects'
  ) then
    return;
  end if;

  insert into storage.buckets (id, name, public)
    values ('avatars', 'avatars', true)
    on conflict (id) do update set public = true;

  execute 'drop policy if exists "avatars_read" on storage.objects';
  execute 'create policy "avatars_read" on storage.objects for select using (bucket_id = ''avatars'')';

  execute 'drop policy if exists "avatars_insert_own" on storage.objects';
  execute 'create policy "avatars_insert_own" on storage.objects for insert to authenticated '
       || 'with check (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text)';

  execute 'drop policy if exists "avatars_update_own" on storage.objects';
  execute 'create policy "avatars_update_own" on storage.objects for update to authenticated '
       || 'using (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text)';

  execute 'drop policy if exists "avatars_delete_own" on storage.objects';
  execute 'create policy "avatars_delete_own" on storage.objects for delete to authenticated '
       || 'using (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text)';
end $$;
