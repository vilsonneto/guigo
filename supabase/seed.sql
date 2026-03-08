-- Guigo — Dados iniciais
-- Obrigacoes reais do pai (entrevista 07/03/2026)
-- Cenario: pos-junho/2026 (sem ajuda do Vilson, com internet)
-- Criterio de arredondamento: sempre pra cima (melhor sobrar do que faltar)

INSERT INTO obrigacoes (nome, valor_total, ciclo, cota_diaria) VALUES
  ('Aluguel do carro', 800, 'semanal', 115),       -- R$800 / 7 = R$114.28 → R$115
  ('Manutencao do carro', 600, 'mensal', 20),       -- R$20/dia x 30 dias
  ('Luz', 850, 'mensal', 33),                        -- R$850 / 26 = R$32.69 → R$33
  ('Agua', 200, 'mensal', 8),                        -- R$200 / 26 = R$7.69 → R$8
  ('Gas', 125, 'mensal', 5),                         -- R$125 / 26 = R$4.81 → R$5
  ('Internet', 80, 'mensal', 4),                     -- R$80 / 26 = R$3.08 → R$4
  ('Alimentacao', 20, 'diario', 20),                 -- R$20/dia fixo
  ('Reserva de emergencia', 20, 'diario', 20);       -- R$20/dia, acumula sempre

-- Custo diario total: R$225
-- Livre medio: R$370 - R$120 (gasolina) - R$225 = R$25/dia
