# WordPress MG Sports — Conteúdo

URL pública: https://mg.11run.com.br/conteudo/

Painel: https://mg.11run.com.br/conteudo/wp-admin/

Tema próprio `mg-content`, baseado nos menus completos, hero e rodapé consultados em https://www.mgsports.com.br/. A consulta é feita no build e salva como JSON no tema: visitas não dependem de uma chamada ao site da loja. Se a fonte estiver indisponível, o importador usa a última cópia verificada de menu, hero e rodapé em `source.html`, preservando a data da consulta. Um novo deploy atualiza a identidade importada sem sobrescrever posts ou uploads. Links de comércio abrem a loja oficial; conta e carrinho não são simulados no blog.

## Publicar

No painel, use **Posts → Adicionar novo**, preencha título e conteúdo e marque **SEO Macro**. A categoria é criada como padrão. O modelo **SEO Macro** é selecionável no editor e aplicado automaticamente aos posts dessa categoria. A home mostra o último post publicado dessa categoria; antes da primeira publicação mostra o conteúdo da página inicial e um estado vazio. Não há artigos fictícios publicados.

## Infraestrutura

- `mgsports-wordpress`: WordPress 7.1.3 / PHP 8.3 / Apache, porta interna 80.
- `mgsports-wordpress-db`: MariaDB 11.4, sem porta pública, volume próprio.
- Volume de arquivos em `/var/www/html`, incluindo core, uploads e plugins.
- O NGINX da aplicação `mgsports` encaminha apenas `/conteudo/` para WordPress. App, HTTPS e PostgreSQL existentes são preservados.
- Segredos ficam nas variáveis do CapRover. `WP_ADMIN_EMAIL`, `WP_ADMIN_USER` e `WP_ADMIN_PASSWORD` são usados na instalação inicial. Alterar a variável não redefine a senha de uma instalação existente: use o fluxo normal de recuperação/administração do WordPress.

Scripts: `node scripts/caprover-wordpress.mjs setup`, `status`, `route` e `deploy`. A aplicação usa `./captain-definition-wordpress`, na raiz do repositório, para manter o contexto de build correto também na versão do CapRover deste servidor. O setup exige `CAPROVER_PASSWORD` e `WP_ADMIN_EMAIL`; não coloque seus valores em arquivos versionados. A rota só deve ser ativada após o WordPress estar preparado. A cópia anterior do template NGINX fica em `.cache/mgsports-nginx-before-wordpress.ejs` para recuperação.

O build executa lint de PHP, testes do importador e validação da fonte oficial. O bootstrap valida banco, tema ativo e categoria. Os webhooks do mesmo repositório atualizam os containers existentes de forma independente.

Idioma do site e do administrador: `pt_BR`. Fuso: `America/Sao_Paulo` (Brasília), data `d/m/Y` e hora `H:i`. O bootstrap regenera apenas o bloco WordPress de `.htaccess`, com base `/conteudo/`, preservando outros blocos. Diretórios de plugins, uploads, instalação temporária e idiomas pertencem a `www-data`; o início do container verifica que o usuário do Apache pode gravar neles, sem permissões globais `777`.

## Privacidade e manutenção

O tema não instala analytics, cookies de publicidade ou formulários de captação. O WordPress mantém sua autenticação administrativa; imagens externas são descritas na política nativa em `/conteudo/privacidade/`. Referência legal: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm.

Manter backups independentes de MariaDB e do volume de arquivos; persistência de volume não substitui backup. Envio de e-mail/SMTP não é provisionado por esta instalação e precisa ser configurado para garantir notificações e recuperação de acesso. Atualizações de segurança menores do core estão habilitadas; versões maiores, plugins e tema devem ser atualizados e verificados de forma controlada.

Fontes técnicas: https://hub.docker.com/_/wordpress, https://hub.docker.com/_/mariadb, https://caprover.com/docs/nginx-customization.html, https://developer.wordpress.org/themes/classic-themes/basics/template-hierarchy/.
