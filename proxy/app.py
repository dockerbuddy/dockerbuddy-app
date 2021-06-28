from influx_settings import alerts_settings
from flask import Flask, jsonify, request
from resolvers import bucket_resolvers, organization_resolvers, query_resolvers, notification_check_resolvers
from utils import INFLUXDB_TOKEN
import json
from flask_cors import CORS
from werkzeug.exceptions import BadRequestKeyError
from notification_module import notifications_handler as notifications_handler_module
from flask_socketio import SocketIO


app = Flask(__name__)
CORS(app)
CONTENT_TYPE = 'application/json'
API_VERSION = 'v1'
socketio = SocketIO(app, cors_allowed_origins='*')
notifications_handler = notifications_handler_module.NotificationHandler(app.logger, socketio)



# set up of endpoints and rules for notifications
# runs once at the start of application
@app.before_first_request
def init():
    try:
        settings_provider = alerts_settings.SettingsProvider()
        settings_provider.get_organization_id()
        settings_provider.setup_notification_endpoint()
        settings_provider.setup_any_rule()
    except Exception:
        pass


# return token for InfluxDB
@app.route('/', methods=['GET'])
def get_influxdb_token():
    return jsonify({'INFLUXDB_TOKEN': INFLUXDB_TOKEN})


# returns first 20 buckets by default
# each bucket is represented by:
# - id
# - name
# - organization id
@app.route(f'/api/{API_VERSION}/buckets', methods=['GET'])
def get_all_buckets():
    buckets = bucket_resolvers.fetch_all_buckets()

    if 'code' in buckets and buckets['code'][0] != 2:
        return create_error_response(buckets['message'], buckets['code'])

    parsed_buckets = []

    for bucket in buckets['buckets']:
        parsed_buckets.append({
            'id': bucket['id'],
            'name': bucket['name'],
            'org_id': bucket['orgID']
        })

    response = {
        'buckets': parsed_buckets
    }

    return create_response(response, 200)


# returns all organizations form InfluxDB.
# each bucket is represented by id and name
@app.route(f'/api/{API_VERSION}/orgs', methods=['GET'])
def get_all_organizations():
    orgs = organization_resolvers.fetch_all_organizations()

    if 'code' in orgs and orgs['code'][0] != 2:
        return create_error_response(orgs['message'], orgs['code'])

    parsed_orgs = []

    for org in orgs['orgs']:
        parsed_orgs.append({
            'id': org['id'],
            'name': org['name']
        })

    response = {
        'orgs': parsed_orgs
    }

    return create_response(response, 200)


# creates bucket corresponding particular host
# returns bucket info:
#  - bucket id
#  - bucket name
#  - organization id
# and access token
@app.route(f'/api/{API_VERSION}/hosts', methods=['POST'])
def create_bucket_for_host():
    data = request.json
    status = 201

    if not data:
        err_msg = 'Incorrect data format. Only application/json accepted'
        status = 400
        return create_error_response(err_msg, status)
    if 'bucket_name' not in data:
        err_msg = 'Missing bucket_name'
        status = 400
        return create_error_response(err_msg, status)
    if 'ip_address' not in data:
        err_msg = 'Missing ip_address'
        status = 400
        return create_error_response(err_msg, status)

    name = data['bucket_name']  # name of a bucket to create
    host_ip = data['ip_address']  # host's ip address

    try:
        org_id = data['org_id']  # organization's id: bucket will be assigned to it
    except KeyError:
        org_id = organization_resolvers.fetch_all_organizations()['orgs'][0]['id']

    try:
        retention = data['retention']  # retention of data in bucket (in seconds)
    except KeyError:
        retention = 0  # default: 0 (never expire)

    name = name + " " + host_ip  # TODO return error response when name already contains spaces

    bucket = bucket_resolvers.create_bucket(name, org_id, retention)
    app.logger.info(org_id)
    app.logger.info(type(name))
    notification_check_resolvers.create_check_for_bucket(name, "virtual_memory", org_id)
    notification_check_resolvers.create_check_for_bucket(name, "disk", org_id)


    if "code" in bucket:
        return create_error_response(bucket['message'], bucket['code'])

    response = {
        'id': bucket['id'],
        'name': bucket['name'],
        'org_id': bucket['orgID']
    }

    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps({
            'access_token': INFLUXDB_TOKEN,
            'bucket': response
        }),
        status=status,
    )


@app.route(f'/hook/notifications', methods=['POST'])
def push_notification():
    notifications_handler.handle_influx_message(request.json)
    return "ok"

# returns names stats for each host: containers' stats, disk and virtual_memory
@app.route(f'/api/{API_VERSION}/hosts', methods=['GET'])
def get_hosts():
    start = resolution = None

    try:
        start = request.args['start']  # query parameter 'start': relative start time of measurements (eg. -1h)
        resolution = request.args['res']  # query parameter 'res': resolution of measurements (eg. 10s) (but not sure)
    except BadRequestKeyError as brke:
        return create_error_response(f"Missing query parameter(s). ({brke})", 400)

    buckets = bucket_resolvers.fetch_all_buckets()['buckets']
    hosts = {}

    if 'code' in buckets and buckets['code'][0] != 2:
        return create_error_response(buckets['message'], buckets['code'])

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

    return create_response(hosts, 200)


# return error response in an unified format
def create_error_response(err_msg, status):
    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps({
            'error': err_msg
        }),
        status=status
    )


# returns response in json format
def create_response(data: dict, status):
    return app.response_class(
        content_type=CONTENT_TYPE,
        response=json.dumps(data),
        status=status
    )
