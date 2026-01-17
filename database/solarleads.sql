-- ============================================
-- CRIAR TABELAS
-- ============================================

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    valor_conta DECIMAL(10, 2),
    consumo_kwh INTEGER,
    tipo_imovel VARCHAR(50),
    proprietario BOOLEAN,
    localizacao VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    interesse VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('sent', 'received')),
    agent VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_lead ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_audience JSONB,
    message_template TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Propostas
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    valor_investimento DECIMAL(12, 2),
    economia_mensal DECIMAL(10, 2),
    economia_anual DECIMAL(12, 2),
    roi_anos DECIMAL(5, 2),
    potencia_sistema DECIMAL(10, 2),
    num_placas INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Estados de Conversa
CREATE TABLE IF NOT EXISTS conversation_states (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    stage VARCHAR(50) DEFAULT 'initial',
    context JSONB,
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(lead_id)
);

-- Tabela de Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    lead_id INTEGER REFERENCES leads(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- ============================================
-- FUNÇÃO DE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON proposals
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

INSERT INTO leads (phone, name, email, valor_conta, consumo_kwh, tipo_imovel, proprietario, localizacao, cidade, estado, status, interesse, created_at) VALUES
('+5562987654321', 'João Silva', 'joao@email.com', 680.00, 450, 'casa', true, 'Goiânia, GO', 'Goiânia', 'GO', 'qualified', 'Alto', NOW() - INTERVAL '2 days'),
('+5562912345678', 'Maria Santos', 'maria@email.com', 480.00, 320, 'apartamento', true, 'Goiânia, GO', 'Goiânia', 'GO', 'negotiation', 'Médio', NOW() - INTERVAL '1 day'),
('+5562998765432', 'Pedro Oliveira', 'pedro@email.com', 870.00, 580, 'casa', true, 'Aparecida de Goiânia, GO', 'Aparecida de Goiânia', 'GO', 'new', 'Alto', NOW()),
('+5562988776655', 'Ana Costa', 'ana@email.com', 350.00, 230, 'apartamento', true, 'Goiânia, GO', 'Goiânia', 'GO', 'qualified', 'Médio', NOW() - INTERVAL '3 days'),
('+5562977665544', 'Carlos Souza', 'carlos@email.com', 920.00, 620, 'casa', true, 'Senador Canedo, GO', 'Senador Canedo', 'GO', 'proposal', 'Alto', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Mensagens de exemplo
INSERT INTO messages (lead_id, message, direction, agent, created_at) VALUES
(1, 'Olá, quero saber sobre energia solar', 'received', NULL, NOW() - INTERVAL '2 days'),
(1, 'Olá! Bem-vindo ao SolarLeads. Qual é o valor médio da sua conta de luz?', 'sent', 'Atendimento', NOW() - INTERVAL '2 days'),
(1, 'Uns 680 reais', 'received', NULL, NOW() - INTERVAL '2 days'),
(2, 'Quanto custa instalar energia solar?', 'received', NULL, NOW() - INTERVAL '1 day'),
(2, 'O investimento varia conforme o consumo. Qual o valor da sua conta?', 'sent', 'Atendimento', NOW() - INTERVAL '1 day'),
(3, 'Gostaria de receber um orçamento', 'received', NULL, NOW())
ON CONFLICT DO NOTHING;

-- Propostas de exemplo
INSERT INTO proposals (lead_id, valor_investimento, economia_mensal, economia_anual, roi_anos, potencia_sistema, num_placas, status) VALUES
(1, 40800.00, 578.00, 6936.00, 5.9, 6.8, 15, 'pending'),
(5, 55200.00, 782.00, 9384.00, 5.9, 9.2, 20, 'sent')
ON CONFLICT DO NOTHING;