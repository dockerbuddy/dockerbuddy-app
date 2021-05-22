import influxdb_client
from flask import Flask
from flask import jsonify
import os

app = Flask(__name__)


@app.route('/')
def hello_world():
    token = os.environ['INFLUXDB_TOKEN']
    return jsonify({"token": token})

