# Meu Olympikus

PWA de recomendação, rotação e compra contextual de tênis da Família Corre.

## Desenvolvimento

1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Inicie PostgreSQL e aplicação com `docker compose up --build`.
3. Abra `http://localhost`, `/login`, `/admin` e `/api/health`.

O motor usa scoring ponderado e fatores estruturados, registra a versão `shoe-recommender-1.0.0` e mantém catálogo, matriz e pesos no PostgreSQL.
