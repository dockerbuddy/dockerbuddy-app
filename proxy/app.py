from influxdb_client import InfluxDBClient
from flask import Flask
from flask import jsonify
import os

app = Flask(__name__)
INFLUXDB_TOKEN = os.environ['INFLUXDB_TOKEN']
client = InfluxDBClient(url="http://influxdb:8086", token=INFLUXDB_TOKEN)
buckets_api = client.buckets_api()


@app.route('/')
def print_buckets():
    buckets = buckets_api.find_buckets().buckets
    print(buckets)
    return jsonify({'INFLUXDB_TOKEN': INFLUXDB_TOKEN})

