-- Criar tabela de automações
CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(100) NOT NULL, -- 'no_response', 'lead_created', 'status_changed', 'time_based'
  trigger_config JSONB DEFAULT '{}',
  action_type VARCHAR(100) NOT NULL, -- 'send_message', 'update_status', 'assign_user', 'send_email'
  action_config JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
CREATE INDEX IF NOT EXISTS idx_automations_trigger_type ON automations(trigger_type);

-- Registrar migration
INSERT INTO migrations (name) VALUES ('002_create_automations') ON CONFLICT (name) DO NOTHING;
