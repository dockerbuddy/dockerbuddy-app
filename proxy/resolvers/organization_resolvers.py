from utils import INFLUXDB_TOKEN, ENCODING
import requests
import json


# retrieves (by default) first 20 organizations form InfluxDB
# https://docs.influxdata.com/influxdb/v2.0/api/#operation/GetOrgs
def fetch_all_organizations():
    response = requests.get(
        url='http://influxdb:8086/api/v2/orgs',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        }
    )
    organizations_dict = json.loads(response.content.decode(ENCODING))
    print(organizations_dict, flush=True)
    return organizations_dict
