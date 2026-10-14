<?php
/* Template Name: SEO Macro
 * Template Post Type: post, page
 */
get_header(); while (have_posts()): the_post(); get_template_part('template-parts/article'); endwhile; get_footer();
