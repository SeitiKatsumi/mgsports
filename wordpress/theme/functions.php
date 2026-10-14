<?php
require_once __DIR__.'/inc/store-source.php';
add_action('after_setup_theme', function() {
    add_theme_support('title-tag'); add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form','gallery','caption','style','script']);
    add_theme_support('responsive-embeds'); add_theme_support('editor-styles');
    add_editor_style('style.css');
});
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_style('mg-content', get_stylesheet_uri(), [], filemtime(__DIR__.'/style.css'));
    wp_enqueue_script('mg-content', get_template_directory_uri().'/assets/menu.js', [], filemtime(__DIR__.'/assets/menu.js'), true);
});
add_filter('single_template', function($template) {
    return has_category('seo-macro') ? __DIR__.'/templates/seo-macro.php' : $template;
});
function mg_brand(): array {
    static $data;
    if (!$data) $data = json_decode(file_get_contents(__DIR__.'/store-source.json'), true, 512, JSON_THROW_ON_ERROR);
    return $data;
}
function mg_icon(string $name): void {
    $paths = ['search'=>'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>','user'=>'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>','bag'=>'<path d="M4 7h16v14H4zM8 7V5a4 4 0 0 1 8 0v2"/>','menu'=>'<path d="M4 6h16M4 12h16M4 18h16"/>','arrow'=>'<path d="M5 12h14m-6-6 6 6-6 6"/>','shield'=>'<path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7zM8 12l3 3 5-6"/>'];
    echo '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'.($paths[$name] ?? $paths['arrow']).'</svg>';
}
