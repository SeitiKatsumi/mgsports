<?php
$host=getenv('WORDPRESS_DB_HOST'); $user=getenv('WORDPRESS_DB_USER'); $password=getenv('WORDPRESS_DB_PASSWORD'); $database=getenv('WORDPRESS_DB_NAME');
mysqli_report(MYSQLI_REPORT_OFF);
$connection=false;
for ($attempt=0; $attempt<30; $attempt++) {
    $connection=@new mysqli($host, $user, $password, $database);
    if (!$connection->connect_errno) break;
    usleep(2000000);
}
if (!$connection || $connection->connect_errno) throw new RuntimeException('O banco WordPress não está disponível.');
$connection->close();
$site=getenv('MG_SITE_URL');
if ($site!=='https://mg.11run.com.br/conteudo') throw new RuntimeException('MG_SITE_URL inválido.');
$_SERVER['HTTP_HOST']='mg.11run.com.br'; $_SERVER['HTTPS']='on'; $_SERVER['REQUEST_URI']='/conteudo/'; $_SERVER['SERVER_SOFTWARE']='Apache';
define('WP_INSTALLING', true);
require '/var/www/html/conteudo/wp-load.php';
require_once ABSPATH.'wp-admin/includes/upgrade.php';
if (!is_blog_installed()) {
    $email=getenv('WP_ADMIN_EMAIL'); $admin=getenv('WP_ADMIN_USER'); $adminPassword=getenv('WP_ADMIN_PASSWORD');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9_\-]{3,40}$/', $admin) || strlen($adminPassword)<24) throw new RuntimeException('Credenciais administrativas ausentes ou inválidas.');
    add_filter('pre_wp_mail', fn()=>true);
    $installed=wp_install('MG Sports — Conteúdo', $admin, $email, true, '', $adminPassword, 'pt_BR');
    if (is_wp_error($installed)) throw new RuntimeException('Não foi possível instalar o WordPress.');
    foreach (get_posts(['post_type'=>['post','page'],'post_status'=>'publish','numberposts'=>-1]) as $sample) wp_update_post(['ID'=>$sample->ID,'post_status'=>'draft']);
    update_option('users_can_register', 0); update_option('default_comment_status','closed'); update_option('default_ping_status','closed');
    update_option('timezone_string','America/Sao_Paulo'); update_option('date_format','d/m/Y'); update_option('permalink_structure','/%postname%/');
    echo "WordPress instalado com administrador configurado.\n";
}
switch_theme('mg-content');
$owner=get_user_by('login',getenv('WP_ADMIN_USER'));
if ($owner) wp_set_current_user($owner->ID);
update_option('WPLANG','pt_BR');
update_option('timezone_string','America/Sao_Paulo');
update_option('gmt_offset',-3);
update_option('date_format','d/m/Y'); update_option('time_format','H:i');
if ($owner) update_user_meta($owner->ID,'locale','pt_BR');
if (!get_option('mg_content_setup_version')) {
    $category=get_term_by('slug','seo-macro','category');
    if (!$category) {
        $created=wp_insert_term('SEO Macro','category',['slug'=>'seo-macro']);
        if (is_wp_error($created)) throw new RuntimeException('Não foi possível criar SEO Macro.');
        $category=get_term($created['term_id'],'category');
    }
    update_option('default_category', $category->term_id);
    $home=wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_title'=>'Conteúdo MG Sports','post_name'=>'inicio','post_content'=>''], true);
    if (is_wp_error($home)) throw new RuntimeException('Não foi possível criar a home.');
    update_option('show_on_front','page'); update_option('page_on_front',$home);
    $privacy=wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_title'=>'Política de Privacidade','post_name'=>'privacidade','post_content'=>
        '<p>Esta política descreve o tratamento de dados no portal de conteúdo MG Sports, disponível em mg.11run.com.br/conteudo.</p>'
        .'<h2>Responsável e contato</h2><p>MG Sports — J.L Molina Granero, CNPJ 03.095.664/0001-70. Para dúvidas e solicitações sobre privacidade, utilize o <a href="https://www.mgsports.com.br/fale-conosco/">canal de contato da MG Sports</a>.</p>'
        .'<h2>Navegação e registros técnicos</h2><p>A leitura dos artigos não exige cadastro. O servidor pode registrar endereço IP, data, horário, página solicitada e informações técnicas do navegador para operação, diagnóstico e proteção do serviço. Não adicionamos ferramentas de publicidade ou rastreamento comportamental a este portal.</p>'
        .'<h2>Cookies e administração</h2><p>O WordPress utiliza cookies necessários para autenticação e funcionamento do painel dos editores. Cadastro público e comentários estão desativados nesta configuração. Editores autorizados podem ter nome, e-mail e conteúdo de suas publicações armazenados no banco de dados.</p>'
        .'<h2>Imagens e links externos</h2><p>O banner e os elementos comerciais são provenientes da loja MG Sports. O carregamento de imagens em seu CDN pode transmitir informações técnicas, como IP e navegador, ao servidor da imagem. Busca, conta, carrinho, redes sociais e WhatsApp abrem serviços externos, sujeitos às respectivas políticas.</p>'
        .'<h2>Finalidades e retenção</h2><p>Os dados são utilizados para disponibilizar o conteúdo, administrar publicações e manter a segurança. Registros técnicos e dados administrativos são mantidos conforme a necessidade operacional, obrigações legais e procedimentos de segurança, e devem ser eliminados ou anonimizados quando não forem mais necessários.</p>'
        .'<h2>Segurança e acesso</h2><p>A conexão pública utiliza HTTPS. O painel exige autenticação e o acesso administrativo é restrito a pessoas autorizadas. Nenhum sistema está isento de riscos; incidentes devem ser comunicados pelo canal de contato.</p>'
        .'<h2>Seus direitos</h2><p>Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, informações sobre compartilhamento e, quando aplicável, exclusão, oposição ou revogação de consentimento. A solicitação pode exigir confirmação de identidade para evitar acesso indevido.</p>'
        .'<h2>Atualizações</h2><p>Esta política deve ser revisada se forem adicionados formulários, comentários, analytics, marketing ou novas integrações. Consulte também a <a href="https://www.mgsports.com.br/institucional/politica-de-privacidade/">política da loja oficial</a>.</p>'], true);
    if (is_wp_error($privacy)) throw new RuntimeException('Não foi possível criar a política de privacidade.');
    update_option('wp_page_for_privacy_policy', $privacy);
    update_option('mg_content_setup_version', '1.0.0');
}
require_once ABSPATH.'wp-admin/includes/misc.php';
$wp_rewrite->init();
flush_rewrite_rules(false);
$rewriteRules=$wp_rewrite->mod_rewrite_rules();
if (!str_contains($rewriteRules,'RewriteBase /conteudo/')) throw new RuntimeException('Base de links permanentes inválida.');
if (!insert_with_markers(ABSPATH.'.htaccess','WordPress',explode("\n",trim($rewriteRules)))) throw new RuntimeException('Não foi possível gravar as regras de links permanentes.');
$category=get_term_by('slug','seo-macro','category');
if (!$category || $category->name!=='SEO Macro' || get_option('stylesheet')!=='mg-content') throw new RuntimeException('Validação final do WordPress falhou.');
echo "Tema MG Sports ativo, home configurada e categoria SEO Macro verificada.\n";
