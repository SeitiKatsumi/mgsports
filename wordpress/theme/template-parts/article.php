<article id="post-<?php the_ID(); ?>" <?php post_class('macro-article'); ?>>
  <div class="article-meta"><a href="<?php echo esc_url(get_category_link(get_category_by_slug('seo-macro'))); ?>">SEO Macro</a><span><?php echo esc_html(get_the_date()); ?></span></div>
  <h1><?php echo esc_html(get_the_title()); ?></h1>
  <?php if (has_post_thumbnail()): ?><div class="article-cover"><?php the_post_thumbnail('large', ['loading'=>'lazy']); ?></div><?php endif; ?>
  <div class="article-content"><?php the_content(); ?></div>
  <?php if (!is_singular()): ?><a class="article-link" href="<?php the_permalink(); ?>">Abrir este conteúdo <?php mg_icon('arrow'); ?></a><?php endif; ?>
  <?php wp_link_pages(['before'=>'<nav class="article-pages">Páginas: ', 'after'=>'</nav>']); ?>
</article>
