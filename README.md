# MG Sports — Running Intelligence

Assistente de corrida multimarcas com identidade MG Sports, catálogo consultado na TM Runners e links diretos para cada produto.

O fluxo reúne os tênis que o corredor possui, prova-alvo, tempo, medidas, categorias de atividade e sinais de carga. As sete categorias são Caminhada, Meia maratona, Placa de carbono, Prova, Treino diário, Velocidade e Trilha. Há busca por nome, marca e categoria, fichas completas, fontes opcionais de treino (Strava, Garmin e captura da planilha), conversa com MG AI e contatos das unidades MG Sports.

## Rodar localmente

Instale as dependências com `pnpm install`, configure as variáveis conforme `.env.example` e use `pnpm dev`. A prévia é acessível em `http://localhost:3000`. `pnpm build` prepara o build e `pnpm test` executa os testes. As páginas e fotos do catálogo funcionam localmente; persistência, IA e cálculo de proximidade exigem os serviços correspondentes.

## Catálogo e fontes

`src/data/tm-catalog.json` contém a consulta das páginas públicas da TM Runners. As imagens correspondentes são baixadas e otimizadas pelo CDN em WebP. `pnpm catalog:sync` atualiza os produtos encontrados nas sete categorias, seguindo a paginação da loja. O importador usa Node e o comando `curl`, mantém cache da consulta diária em `.cache/` e exclui roupas e produtos cujas fichas não possam ser verificadas.

A classificação comercial da loja orienta as categorias. As sugestões filtram primeiro a categoria escolhida e, dentro dela, priorizam o maior preço consultado na loja (`priceCents`, em centavos de reais). A afinidade contextual desempata preços iguais; preços não informados ficam no fim. O preço é uma fotografia da consulta indicada em `checkedAt`, não um indicador técnico de performance. O material da placa vem da descrição técnica: fibra de vidro e nylon não são tratados como carbono. Peso de embalagem não é usado como peso do tênis. Dados não declarados ficam ausentes. Preço, tamanho e estoque atuais devem ser consultados na página do produto; este aplicativo não sincroniza inventário em tempo real.

Logo oficial: https://www.mgsports.com.br/

Produtos: https://www.lojatmrunners.com.br/

Rede física e contatos: https://www.mgsports.com.br/pagina/nossas-lojas1/

## Produção

O Docker e o `captain-definition` estão preparados para CapRover. A aplicação atende internamente na porta 3000, publicada pelo proxy nas portas 80/443. No início do container, Prisma sincroniza o schema PostgreSQL e cadastra o catálogo antes de iniciar o servidor.

Use uma aplicação e banco exclusivos `mgsports` / `mgsports-postgres`. Variáveis: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL` e, para cálculo de distâncias das unidades oficiais, `GOOGLE_MAPS_API_KEY` com Geocoding API habilitada. As rotas e WhatsApp funcionam sem a chave de mapas.

Repositório de publicação: https://github.com/SeitiKatsumi/mgsports

Domínio: https://mg.11run.com.br
