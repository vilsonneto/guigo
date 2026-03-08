-- Guigo — Dados iniciais
-- Obrigacoes reais do pai (entrevista 07/03/2026)
-- Dias de trabalho: 7/semana (carro), 26/mes (contas)

INSERT INTO obrigacoes (nome, valor_total, ciclo, cota_diaria) VALUES
  ('Aluguel do carro', 800, 'semanal', 114),    -- R$800 / 7 dias
  ('Manutencao do carro', 520, 'mensal', 20),    -- ~R$20/dia
  ('Luz', 850, 'mensal', 33),                     -- R$850 / 26 dias
  ('Agua', 200, 'mensal', 8),                     -- R$200 / 26 dias
  ('Gas', 125, 'mensal', 5),                      -- R$125 / 26 dias
  ('Reserva de emergencia', 520, 'mensal', 20);   -- R$20/dia

-- Nota: Internet (R$80/mes) sera adicionada a partir de julho/2026
-- quando Vilson sair de casa e parar de pagar
