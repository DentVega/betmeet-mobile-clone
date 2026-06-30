-- Bolt 6 — fn_set_nickname: atomic nickname + discriminator assignment (ADR-012).
-- SECURITY DEFINER + auth.uid(); called by the set-nickname Edge Function.

create or replace function public.fn_set_nickname(p_base text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_disc text;
  v_try integer;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_base !~ '^[A-Za-z0-9_-]{3,20}$' then raise exception 'INVALID'; end if;

  for v_try in 1..10 loop
    v_disc := lpad((floor(random() * 10000))::int::text, 4, '0');
    if not exists (
      select 1 from public.profiles
      where lower(nickname_base) = lower(p_base)
        and nickname_discriminator = v_disc
        and deleted_at is null
    ) then
      update public.profiles
        set nickname_base = p_base,
            nickname_discriminator = v_disc,
            nickname_updated_at = now(),
            nickname_change_count = nickname_change_count + 1
        where id = v_uid;
      return jsonb_build_object('ok', true, 'nickname', p_base || '#' || v_disc);
    end if;
  end loop;

  raise exception 'NICKNAME_TAKEN';
end;
$$;

grant execute on function public.fn_set_nickname(text) to authenticated;
