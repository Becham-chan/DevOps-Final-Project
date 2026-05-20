#!/bin/sh
python manage.py collectstatic --noinput
python manage.py migrate
python create_superuser.py
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 2