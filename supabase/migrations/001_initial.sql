-- Guigo — Schema inicial
-- Baseado nos dados reais da entrevista (07/03/2026)

-- Configuracao das obrigacoes
CREATE TABLE obrigacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  valor_total DECIMAL NOT NULL,
  ciclo TEXT NOT NULL CHECK (ciclo IN ('semanal', 'mensal', 'diario')),
  cota_diaria DECIMAL NOT NULL,
  ativo BOOLEAN DEFAULT true,
  valido_ate DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Registro diario
CREATE TABLE dias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  receita_bruta DECIMAL,
  gasolina_estimada DECIMAL DEFAULT 120,
  receita_liquida DECIMAL,
  total_reservado DECIMAL,
  livre DECIMAL,
  status TEXT DEFAULT 'validado' CHECK (status IN ('validado', 'suspeito', 'invalidado', 'editado')),
  fonte TEXT DEFAULT 'whatsapp' CHECK (fonte IN ('whatsapp', 'admin', 'pluggy')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saldo dos envelopes
CREATE TABLE envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obrigacao_id UUID REFERENCES obrigacoes(id),
  saldo_acumulado DECIMAL DEFAULT 0,
  meta_ciclo DECIMAL NOT NULL,
  ciclo_inicio DATE,
  pago BOOLEAN DEFAULT false,
  pago_em DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historico de mensagens (debug + painel)
CREATE TABLE mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direcao TEXT NOT NULL CHECK (direcao IN ('recebida', 'enviada')),
  conteudo TEXT NOT NULL,
  processada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log de alteracoes do admin
CREATE TABLE admin_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX idx_dias_data ON dias(data);
CREATE INDEX idx_envelopes_obrigacao ON envelopes(obrigacao_id);
CREATE INDEX idx_mensagens_created ON mensagens(created_at);
