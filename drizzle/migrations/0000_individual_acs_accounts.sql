CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 nome text NOT NULL,
 cpf text NOT NULL DEFAULT '',
 ubs text NOT NULL DEFAULT 'UBS Vila Esperança',
 microarea text NOT NULL DEFAULT 'Microárea 01'
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE UNIQUE INDEX profiles_unique_cpf ON public.profiles (cpf) WHERE cpf <> '';
CREATE TABLE public.acs_workspaces (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 moradores jsonb NOT NULL DEFAULT '[]',
 familias jsonb NOT NULL DEFAULT '{}',
 visitas jsonb NOT NULL DEFAULT '[]',
 cadastros jsonb NOT NULL DEFAULT '[]',
 preferencias jsonb NOT NULL DEFAULT '{}',
 notificacoes_lidas jsonb NOT NULL DEFAULT '[]'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acs_workspaces TO authenticated;
GRANT ALL ON public.acs_workspaces TO service_role;
ALTER TABLE public.acs_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ACS workspace" ON public.acs_workspaces FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE FUNCTION public.create_acs_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.profiles(id,nome,cpf,ubs,microarea) VALUES (
 NEW.id, COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'nome'),''),'Agente ACS'),
 regexp_replace(COALESCE(NEW.raw_user_meta_data->>'cpf',''),'[^0-9]','','g'),
 COALESCE(NULLIF(NEW.raw_user_meta_data->>'ubs',''),'UBS Vila Esperança'),
 COALESCE(NULLIF(NEW.raw_user_meta_data->>'microarea',''),'Microárea 01'));
 INSERT INTO public.acs_workspaces(user_id) VALUES(NEW.id);
 RETURN NEW;
END;
$$;
CREATE TRIGGER on_acs_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_acs_profile();
INSERT INTO public.profiles(id,nome) SELECT id, COALESCE(NULLIF(raw_user_meta_data->>'nome',''),'Agente ACS') FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.acs_workspaces(user_id) SELECT id FROM public.profiles ON CONFLICT DO NOTHING;
CREATE FUNCTION public.save_acs_information(kind text, payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE w public.acs_workspaces; m jsonb; f jsonb; v jsonb; n text; acs_nome text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
 SELECT * INTO w FROM public.acs_workspaces WHERE user_id = auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Conta não encontrada'; END IF;
 IF kind = 'morador' THEN
  m := payload->'morador'; f := payload->'familia'; n := m->>'nome';
  IF COALESCE(n,'') = '' OR COALESCE(m->>'cpf','') = '' OR COALESCE(f->>'codigo','') = '' THEN RAISE EXCEPTION 'Cadastro incompleto'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(w.moradores) AS r WHERE r->>'cpf' = m->>'cpf' OR r->>'nome' = n) THEN RAISE EXCEPTION 'Morador já cadastrado nesta conta'; END IF;
  SELECT value INTO v FROM jsonb_each(w.familias) WHERE value->>'codigo' = f->>'codigo' LIMIT 1;
  IF FOUND THEN f := jsonb_set(v,'{integrantes}',(v->'integrantes') || (f->'integrantes')); END IF;
  UPDATE public.acs_workspaces SET moradores = moradores || jsonb_build_array(m), familias = familias || jsonb_build_object(n,f) WHERE user_id = auth.uid();
 ELSIF kind = 'visita' THEN
  n := payload->>'moradorNome';
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(w.moradores) AS r WHERE r->>'nome' = n) THEN RAISE EXCEPTION 'Morador não pertence à sua conta'; END IF;
  IF payload->>'desfecho' NOT IN ('Realizada','Recusada','Ausente') OR COALESCE(payload->>'data','') = '' THEN RAISE EXCEPTION 'Visita incompleta'; END IF;
  SELECT nome INTO acs_nome FROM public.profiles WHERE id = auth.uid();
  v := payload || jsonb_build_object('id',gen_random_uuid()::text,'acs',acs_nome);
  UPDATE public.acs_workspaces SET visitas = visitas || jsonb_build_array(v), moradores = (
   SELECT jsonb_agg(CASE WHEN r->>'nome' = n AND payload->>'desfecho' = 'Realizada' THEN r || jsonb_build_object('ultimaVisita',payload->>'data','statusProximaVisita','Nova visita em até 30 dias') ELSE r END)
   FROM jsonb_array_elements(moradores) AS r
  ), familias = CASE WHEN familias ? n THEN jsonb_set(familias,ARRAY[n,'historico'], COALESCE(familias->n->'historico','[]'::jsonb) || jsonb_build_array(jsonb_build_object('data',payload->>'data','descricao',(payload->>'motivo') || ' — ' || (payload->>'desfecho')))) ELSE familias END WHERE user_id = auth.uid();
 ELSIF kind = 'cadastro' THEN
  UPDATE public.acs_workspaces SET cadastros = cadastros || jsonb_build_array(payload) WHERE user_id = auth.uid();
 ELSIF kind = 'preferencias' THEN
  UPDATE public.acs_workspaces SET preferencias = payload WHERE user_id = auth.uid();
 ELSIF kind = 'notificacoes' THEN
  UPDATE public.acs_workspaces SET notificacoes_lidas = payload WHERE user_id = auth.uid();
 ELSE RAISE EXCEPTION 'Operação inválida'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.save_acs_information(text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_acs_information(text,jsonb) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_acs_profile() FROM PUBLIC, anon, authenticated;