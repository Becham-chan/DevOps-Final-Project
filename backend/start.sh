#!/bin/sh
python manage.py collectstatic --noinput
python manage.py migrate
python create_superuser.py
python manage.py populate_mock_data
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 2