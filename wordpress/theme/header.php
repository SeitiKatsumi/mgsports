<?php $brand = mg_brand(); ?><!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>><?php wp_body_open(); ?>
<a class="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
<header class="store-header">
  <div class="benefits">Até 10x sem juros · 1ª troca grátis · +30 anos de loja física</div>
  <div class="header-main wrap">
    <button class="menu-toggle" aria-expanded="false" aria-controls="store-navigation" aria-label="Abrir menu"><?php mg_icon('menu'); ?></button>
    <a class="store-logo" href="https://www.mgsports.com.br/"><img src="<?php echo esc_url(get_template_directory_uri().'/assets/logo.webp'); ?>" width="114" height="78" alt="MG Sports"></a>
    <form class="store-search" action="https://www.mgsports.com.br/produto/busca/" method="get"><label class="screen-reader-text" for="store-search">Buscar na loja MG Sports</label><input id="store-search" type="search" name="q" placeholder="O que você procura" required><button aria-label="Pesquisar na loja"><?php mg_icon('search'); ?></button></form>
    <div class="header-actions"><a class="contact-short" href="https://wa.me/5516999653646">(16) 99965-3646</a><a href="https://www.mgsports.com.br/clientes/minha-conta/" aria-label="Minha conta na loja"><?php mg_icon('user'); ?></a><a href="https://www.mgsports.com.br/carrinho-redirect/" aria-label="Carrinho na loja"><?php mg_icon('bag'); ?></a></div>
  </div>
  <nav id="store-navigation" class="store-navigation" aria-label="Menu da MG Sports"><div class="nav-inner wrap">
    <?php foreach ($brand['menu'] as $item): ?>
      <?php if (!$item['groups']): ?><a class="nav-link" href="<?php echo esc_url($item['url']); ?>"><?php echo esc_html($item['title']); ?></a>
      <?php else: ?><details class="nav-group"><summary><?php echo esc_html($item['title']); ?></summary><div class="submenu"><a class="see-all" href="<?php echo esc_url($item['url']); ?>">Ver todos: <?php echo esc_html($item['title']); ?> <?php mg_icon('arrow'); ?></a><div class="submenu-grid">
        <?php foreach ($item['groups'] as $group): ?><section><a class="group-title" href="<?php echo esc_url($group['url']); ?>"><?php echo esc_html($group['title']); ?></a><ul><?php foreach ($group['links'] as $link): ?><li><a href="<?php echo esc_url($link['url']); ?>"><?php echo esc_html($link['title']); ?></a></li><?php endforeach; ?></ul></section><?php endforeach; ?>
      </div></div></details><?php endif; ?>
    <?php endforeach; ?>
  </div></nav>
</header>
<section class="store-hero" aria-label="Campanha da MG Sports">
  <?php foreach ($brand['hero'] as $index=>$banner): $medium=str_replace('w=2560','w=1280',$banner['img']); $small=str_replace('w=2560','w=640',$banner['img']); ?>
  <a href="<?php echo esc_url($banner['url']); ?>"><img src="<?php echo esc_url($medium); ?>" srcset="<?php echo esc_url($small); ?> 640w, <?php echo esc_url($medium); ?> 1280w, <?php echo esc_url($banner['img']); ?> 2560w" sizes="100vw" alt="<?php echo esc_attr($banner['alt']); ?>" <?php echo $index===0?'fetchpriority="high"':'loading="lazy"'; ?>></a>
  <?php endforeach; ?>
</section>
<main id="conteudo-principal" class="editorial wrap">
