FROM wordpress:7.1.3-php8.3-apache
COPY --from=wordpress:cli-2.12.0-php8.3 /usr/local/bin/wp /usr/local/bin/wp
COPY wordpress /opt/mg-wordpress
COPY public/mg-sports-logo.webp /opt/mg-wordpress/theme/assets/logo.webp
RUN find /opt/mg-wordpress -name '*.php' -print0 | xargs -0 -n 1 php -l \
    && php /opt/mg-wordpress/tests/source-test.php \
    && php /opt/mg-wordpress/sync-source.php \
    && chmod +x /opt/mg-wordpress/entrypoint.sh \
    && cp /opt/mg-wordpress/apache.conf /etc/apache2/conf-available/mg-content.conf \
    && a2enconf mg-content
WORKDIR /var/www/html/conteudo
ENTRYPOINT ["/opt/mg-wordpress/entrypoint.sh"]
CMD ["apache2-foreground"]
