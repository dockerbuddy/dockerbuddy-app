import influxdb_client
from flask import Flask
from flask import jsonify
import os

app = Flask(__name__)
INFLUXDB_TOKEN = os.environ['INFLUXDB_TOKEN']


@app.route('/')
def hello_world():

    return jsonify({"INFLUXDB_TOKEN": INFLUXDB_TOKEN})

