<?php
require __DIR__.'/theme/inc/store-source.php';
$request = curl_init('https://www.mgsports.com.br/');
curl_setopt_array($request, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>30, CURLOPT_USERAGENT=>'MG Sports Content/1.0', CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS]);
$html = curl_exec($request); $status = curl_getinfo($request, CURLINFO_RESPONSE_CODE);
try {
    if ($status !== 200 || !is_string($html) || strlen($html) > 3000000) throw new RuntimeException('A página oficial não pôde ser consultada.');
    $data = mg_extract_store($html);
} catch (RuntimeException $error) {
    $data=mg_extract_store(file_get_contents(__DIR__.'/source.html'));
    echo "Consulta ao vivo indisponível; usando a última cópia verificada da fonte oficial.\n";
}
file_put_contents(__DIR__.'/theme/store-source.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
echo 'Fonte oficial importada: '.count($data['menu']).' menus, '.count($data['hero']).' banner(s), '.count($data['footer'])." links no rodapé.\n";
