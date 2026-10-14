#!/bin/bash
set -Eeuo pipefail
docker-ensure-installed.sh true
mkdir -p wp-content/themes/mg-content
cp -a /opt/mg-wordpress/theme/. wp-content/themes/mg-content/
chown -R www-data:www-data wp-content/themes/mg-content
php /opt/mg-wordpress/bootstrap.php
if ! wp --allow-root language core is-installed pt_BR >/dev/null 2>&1; then
  wp --allow-root language core install pt_BR || echo "Tradução pendente; o WordPress poderá tentar novamente."
fi
mkdir -p wp-content/plugins wp-content/uploads wp-content/upgrade wp-content/languages
chown -R www-data:www-data wp-content
for directory in plugins uploads upgrade languages; do
  su -s /bin/sh www-data -c "test -w '$PWD/wp-content/$directory'"
done
echo "Permissões de plugins, uploads, instalação e tradução verificadas para www-data."
exec docker-entrypoint.sh "$@"
