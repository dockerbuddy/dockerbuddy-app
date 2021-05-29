from utils import INFLUXDB_TOKEN, ENCODING
import requests
import json


# retrieves (by default) first 20 buckets for InfluxDB
# https://docs.influxdata.com/influxdb/v2.0/api/#operation/GetBuckets
def fetch_all_buckets():
    response = requests.get(
        url='http://influxdb:8086/api/v2/buckets',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        }
    )
    buckets_dict = json.loads(response.content.decode(ENCODING))
    print(buckets_dict, flush=True)
    return buckets_dict


# creates bucket with given attributes. Returns bucket metadata from InfluxDB
# https://docs.influxdata.com/influxdb/v2.0/api/#operation/PostBuckets
def create_bucket(name, org_id, retention):
    response = requests.post(
        url='http://influxdb:8086/api/v2/buckets',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        },

        json={
            'orgID': org_id,
            'name': name,
            'retentionRules': [
                {
                    'type': 'expire',
                    'everySeconds': retention
                }
            ]
        }
    )
    bucket = json.loads(response.content.decode(ENCODING))
    print(bucket, flush=True)
    return bucket
