from flask import Flask, jsonify, request
from resolvers import bucket_resolvers, organization_resolvers, query_resolvers
from utils import INFLUXDB_TOKEN
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
CONTENT_TYPE = 'application/json'
API_VERSION = 'v1'


# return token for InfluxDB
@app.route('/', methods=['GET'])
def get_influxdb_token():
    return jsonify({'INFLUXDB_TOKEN': INFLUXDB_TOKEN})


# returns first 20 buckets by default
@app.route(f'/api/{API_VERSION}/buckets')
def get_all_buckets():
    buckets = bucket_resolvers.fetch_all_buckets()
    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps(buckets),
        status=200
    )


# returns all organizations form InfluxDB
@app.route(f'/api/{API_VERSION}/orgs')
def get_all_organizations():
    organizations = organization_resolvers.fetch_all_organizations()
    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps(organizations),
        status=200
    )


# creates bucket with given name
# returns bucket info and access token
@app.route(f'/api/{API_VERSION}/buckets', methods=['POST'])
def create_bucket_for_host():
    data = request.json

    if not data:
        return 'Incorrect data format. Only application/json accepted', 400
    if 'bucket_name' not in data:
        return 'Missing bucket_name', 400
    if 'ip_address' not in data:
        return 'Missing ip_address', 400

    name = data['bucket_name']  # name of a bucket to create
    host_ip = data['ip_address']  # host's ip address
    try:
        org_id = data['org_id']  # organization's id: bucket will be assigned to it
    except KeyError:
        org_id = organization_resolvers.fetch_all_organizations()['orgs'][0]['id']  # FIXME ?temporary solution?
    
    try:
        retention = data['retention']  # retention of data in bucket (in seconds)
    except KeyError:
        retention = 0

    name = name + " " + host_ip

    bucket = bucket_resolvers.create_bucket(name, org_id, retention)

    status = 201
    if "code" in bucket and bucket['code'] == "conflict":
        status = 409
        bucket["message"] = "Bucket with provided IP or name already exists"

    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps({
            'access_token': INFLUXDB_TOKEN,
            'bucket': bucket
        }),
        status=status,
    )


# returns names stats for each host: containers' stats, disk and virtual_memory
@app.route(f'/api/{API_VERSION}/hosts', methods=['GET'])
def get_hosts():
    try:
        start = request.args['start']  # query parameter 'start': relative start time of measurements (eg. -1h)
        resolution = request.args['res']  # query parameter 'res': resolution of measurements (eg. 10s) (but not sure)
    except KeyError as ke:
        pass
    buckets = bucket_resolvers.fetch_all_buckets()['buckets']
    hosts = {}

    # transforms flat list of measurement; groups points by: host, _measurement, _field
    def _filter_stats(list_of_data: list):
        res = {}

        for point in list_of_data:
            _mes = point['_measurement']
            _field = point['_field']
            if _mes not in res.keys():
                res[_mes] = {}
            _mes_dict = res[_mes]
            if _field not in _mes_dict.keys():
                _mes_dict[_field] = []
            _field_list = _mes_dict[_field]
            del point['_measurement']  # remove from point to avoid redundancy (information already present as nested)
            del point['_field']  # remove from point to avoid redundancy (information already present as nested)
            _field_list.append(point)

        return res

    for bucket in buckets:
        bucket_name = bucket['name']
        stats = query_resolvers.fetch_stats_for_host(host=bucket_name, start=start, resolution=resolution)
        data = _filter_stats(stats)
        hosts[bucket_name] = data

    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps(
            hosts
        ),
        status=200
    )

