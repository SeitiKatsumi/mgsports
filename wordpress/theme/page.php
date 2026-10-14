<?php get_header(); while (have_posts()): the_post(); ?>
<article class="macro-article"><h1><?php echo esc_html(get_the_title()); ?></h1><div class="article-content"><?php the_content(); ?></div></article>
<?php endwhile; get_footer(); ?>
