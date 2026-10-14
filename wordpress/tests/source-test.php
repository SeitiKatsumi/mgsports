<?php
require __DIR__.'/../theme/inc/store-source.php';
function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); }
check(mg_source_url('/categoria/corrida/') === 'https://www.mgsports.com.br/categoria/corrida/', 'Link relativo');
check(mg_source_url('categoria/calcados/') === 'https://www.mgsports.com.br/categoria/calcados/', 'Link relativo sem barra inicial');
check(mg_source_url('produto/busca/?q=masculino&amp;submit') === 'https://www.mgsports.com.br/produto/busca/?q=masculino&submit', 'Busca relativa com query');
check(mg_source_url('javascript:alert(1)') === '', 'Script rejeitado');
check(mg_source_url('https://www.mgsports.com.br.attacker.test/') === '', 'Host falso rejeitado');
check(mg_source_url('https://user@www.mgsports.com.br/') === '', 'Credencial em URL rejeitada');
check(mg_source_url('https://cdn.shoppub.io/banner.webp', true) !== '', 'Imagem oficial');
$items = ''; $footer = '';
for ($i=0; $i<5; $i++) { $items .= '<li><a href="/categoria/item-'.$i.'/">Calçados</a><section class="submenu-wrapper"><ul><li class="second-category"><a href="/categoria/feminino/">Feminino</a><a class="sub-link-submenu" href="/categoria/corrida/">Corrida</a></li></ul></section></li>'; $footer .= '<a class="footer__link" href="/pagina/lojas/">Nossas Lojas</a>'; }
$data = mg_extract_store('<nav class="nav-menu"><ul class="main-menu">'.$items.'</ul></nav><section class="banner-home"><figure class="banner-home__item"><a href="/categoria/feminino/"><img src="https://cdn.shoppub.io/banner.webp" alt="Banner"></a></figure></section><footer>'.$footer.'<li class="infos">(16) 99965-3646</li><section id="copy">CNPJ: 03.095.664/0001-70</section></footer>');
check(count($data['menu'])===5 && count($data['footer'])===5, 'Estrutura importada');
check($data['menu'][0]['groups'][0]['links'][0]['title']==='Corrida', 'Submenu preservado');
check($data['contacts'][0]==='(16) 99965-3646', 'Contato preservado');
$real=mg_extract_store(file_get_contents(__DIR__.'/../source.html'));
$footwear=array_values(array_filter($real['menu'],fn($item)=>$item['title']==='Calçados'))[0];
check(in_array('Masculino',array_column($footwear['groups'],'title')) && in_array('Feminino',array_column($footwear['groups'],'title')), 'Todos os submenus da fonte real preservados');
try { mg_extract_store('<html>Sem dados</html>'); throw new RuntimeException('Página incompleta aceita'); } catch (RuntimeException $error) { check(str_contains($error->getMessage(),'ausente'), 'Fonte incompleta rejeitada'); }
echo "Testes da importação de marca aprovados.\n";
