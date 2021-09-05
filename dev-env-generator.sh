#!/bin/bash
token=$(date +%s | sha256sum | base64 | head -c 64)
password=$(date +%s | sha256sum | base64 | head -c 10)

echo "INFLUXDB_USERNAME=admin
INFLUXDB_PASSWORD=$password
INFLUXDB_ORGANIZATION=agh-utc
INFLUXDB_ADMIN_TOKEN=$token
INFLUXDB_BUCKET=metrics
INFLUXDB_URL=http://influxdb:8086" >> .env