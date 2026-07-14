FROM php:8.3-cli

# Install system packages and PostgreSQL PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy the Laravel project
COPY . .

# Install production dependencies
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Ensure Laravel can write to these directories
RUN chmod -R 775 storage bootstrap/cache

CMD php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
