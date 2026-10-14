<?php get_header();
$latest=new WP_Query(['post_type'=>'post','post_status'=>'publish','category_name'=>'seo-macro','posts_per_page'=>1,'ignore_sticky_posts'=>true]);
if ($latest->have_posts()): while ($latest->have_posts()): $latest->the_post(); get_template_part('template-parts/article'); endwhile; wp_reset_postdata();
else: while (have_posts()): the_post(); ?>
  <article class="macro-article"><div class="article-meta"><span>SEO Macro</span></div><h1><?php echo esc_html(get_the_title()); ?></h1><div class="article-content"><?php the_content(); ?></div><?php if (!trim(get_the_content())): ?><p class="empty-state">Novos conteúdos em breve.</p><?php endif; ?></article>
<?php endwhile; endif; get_footer(); ?>
