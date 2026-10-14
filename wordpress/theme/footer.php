</main>
<?php $brand=mg_brand(); ?>
<footer class="store-footer">
  <div class="footer-grid wrap">
    <section class="footer-brand"><a href="https://www.mgsports.com.br/"><img src="<?php echo esc_url(get_template_directory_uri().'/assets/logo.webp'); ?>" width="114" height="78" alt="MG Sports"></a><div class="social-links"><?php foreach ($brand['social'] as $social): ?><a href="<?php echo esc_url($social['url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($social['title']); ?></a><?php endforeach; ?><a href="https://wa.me/5516999653646">WhatsApp</a></div></section>
    <section><h2>Informações</h2><ul><?php foreach ($brand['footer'] as $link): ?><li><a href="<?php echo esc_url($link['url']); ?>"><?php echo esc_html($link['title']); ?></a></li><?php endforeach; ?><li><a href="<?php echo esc_url(home_url('/privacidade/')); ?>">Privacidade deste conteúdo</a></li></ul></section>
    <section><h2>Contato</h2><ul><?php foreach ($brand['contacts'] as $contact): ?><li><a href="tel:+55<?php echo esc_attr(preg_replace('/\D/','',$contact)); ?>"><?php echo esc_html($contact); ?></a></li><?php endforeach; ?></ul><a class="footer-store" href="https://www.mgsports.com.br/pagina/nossas-lojas1/">Encontre uma loja <?php mg_icon('arrow'); ?></a></section>
    <section><h2>Segurança</h2><div class="secure-label"><?php mg_icon('shield'); ?><span>Conexão segura · HTTPS</span></div><h2>Tecnologia</h2><span>WordPress · MG Sports</span><div class="payment-label"><small>Na loja oficial</small><span>Visa · Mastercard · Elo · Pix</span></div></section>
  </div>
  <div class="footer-bottom wrap"><span><?php echo esc_html($brand['company']); ?></span><a href="<?php echo esc_url(home_url('/')); ?>">Conteúdo MG Sports</a><a href="https://mg.11run.com.br/">Encontrar meu tênis</a></div>
</footer>
<?php wp_footer(); ?></body></html>
