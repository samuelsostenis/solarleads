-- CRIAR USUÁRIO (se ainda não existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'solarleads') THEN
    CREATE USER solarleads WITH PASSWORD 'samuel';
  END IF;
END
$$;

-- DAR PERMISSÕES
GRANT ALL PRIVILEGES ON DATABASE solarleads TO solarleads;
GRANT ALL ON SCHEMA public TO solarleads;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO solarleads;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO solarleads;