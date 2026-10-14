<?php
function mg_source_url(string $value, bool $image = false): string {
    $value = trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if (str_starts_with($value, '//')) $value = 'https:' . $value;
    elseif (str_starts_with($value, '/')) $value = 'https://www.mgsports.com.br' . $value;
    elseif ($value !== '' && parse_url($value, PHP_URL_SCHEME) === null) $value = 'https://www.mgsports.com.br/' . $value;
    $parts = parse_url($value);
    $hosts = $image ? ['shoppubcdn.com', 'cdn.shoppub.io', 'uploads.shoppub.io'] : ['www.mgsports.com.br', 'mgsports.com.br', 'www.facebook.com', 'www.instagram.com', 'api.whatsapp.com', 'wa.me'];
    return ($parts['scheme'] ?? '') === 'https' && in_array($parts['host'] ?? '', $hosts, true) && !isset($parts['user']) && !isset($parts['port']) ? $value : '';
}
function mg_extract_store(string $html): array {
    $document = new DOMDocument();
    $previous = libxml_use_internal_errors(true);
    $document->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NONET);
    libxml_clear_errors(); libxml_use_internal_errors($previous);
    $xpath = new DOMXPath($document);
    $class = fn(string $name) => "contains(concat(' ',normalize-space(@class),' '),' $name ')";
    $link = function(DOMElement $anchor): array { return ['title'=>trim(preg_replace('/\s+/u',' ', $anchor->textContent)), 'url'=>mg_source_url($anchor->getAttribute('href'))]; };
    $data = ['source'=>'https://www.mgsports.com.br/', 'checkedAt'=>gmdate('Y-m-d'), 'menu'=>[], 'hero'=>[], 'footer'=>[], 'contacts'=>[], 'social'=>[], 'company'=>''];
    $date=$xpath->query('//meta[@name="mg-source-checked-at"]')->item(0);
    if ($date && preg_match('/^\d{4}-\d{2}-\d{2}$/',$date->getAttribute('content'))) $data['checkedAt']=$date->getAttribute('content');
    foreach ($xpath->query('//nav['.$class('nav-menu').']/ul['.$class('main-menu').']/li') as $item) {
        $anchor = $xpath->query('./a', $item)->item(0);
        if (!$anchor) continue;
        $entry = $link($anchor); $entry['groups'] = [];
        foreach ($xpath->query('.//li['.$class('second-category').']', $item) as $group) {
            $title = $xpath->query('./a', $group)->item(0);
            if (!$title) continue;
            $section = $link($title); $section['links'] = [];
            foreach ($xpath->query('.//a['.$class('sub-link-submenu').']', $group) as $child) {
                $childLink = $link($child); if ($childLink['url']) $section['links'][] = $childLink;
            }
            if ($section['url']) $entry['groups'][] = $section;
        }
        if (!$entry['groups']) {
            $children = [];
            foreach ($xpath->query('.//*['.$class('submenu-wrapper').']//a', $item) as $child) {
                $childLink = $link($child); if ($childLink['url']) $children[] = $childLink;
            }
            if ($children) $entry['groups'][] = ['title'=>$entry['title'], 'url'=>$entry['url'], 'links'=>$children];
        }
        if ($entry['url']) $data['menu'][] = $entry;
    }
    foreach ($xpath->query('//*['.$class('banner-home').']//figure['.$class('banner-home__item').']') as $item) {
        $anchor = $xpath->query('.//a', $item)->item(0); $image = $xpath->query('.//img', $item)->item(0);
        if (!$anchor || !$image) continue;
        $url = mg_source_url($anchor->getAttribute('href')); $src = mg_source_url($image->getAttribute('src'), true);
        if ($url && $src) $data['hero'][] = ['url'=>$url,'img'=>$src,'alt'=>$image->getAttribute('alt')];
    }
    foreach ($xpath->query('//footer//a['.$class('footer__link').']') as $anchor) {
        $entry = $link($anchor); if ($entry['url']) $data['footer'][] = $entry;
    }
    foreach ($xpath->query('//footer//li['.$class('infos').']') as $item) $data['contacts'][] = trim($item->textContent);
    foreach ($xpath->query('//footer//div['.$class('midias').']//a') as $anchor) {
        $url = mg_source_url($anchor->getAttribute('href'));
        if (str_contains($url, 'facebook.com') || str_contains($url, 'instagram.com')) $data['social'][] = ['title'=>str_contains($url,'facebook.com')?'Facebook':'Instagram','url'=>$url];
    }
    $company = $xpath->query('//footer//*[@id="copy"]')->item(0);
    if ($company) $data['company'] = trim(preg_replace('/\s+/u', ' ', $company->textContent));
    if (count($data['menu']) < 5 || !$data['hero'] || count($data['footer']) < 5) throw new RuntimeException('Menu, banner ou rodapé ausente na fonte oficial.');
    return $data;
}
