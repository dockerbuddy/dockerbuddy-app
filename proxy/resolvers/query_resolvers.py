from utils import INFLUXDB_TOKEN, ENCODING
import requests
import json
import csv
import io


# fetches all stats in bucket (host) form InfluxDB
# https://docs.influxdata.com/influxdb/v2.0/api/#operation/PostQuery
# https://docs.influxdata.com/influxdb/v2.0/query-data/execute-queries/influx-api/
def fetch_stats_for_host(host, org='agh-utc', start="-1h", resolution="10s"):
    response = requests.post(
        url=f'http://influxdb:8086/api/v2/query?org={org}',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        },
        json={
            # "query": f"from(bucket: \"{host}\")\n"
            #          f"|> range(start: {start})\n"
            #          f"|> filter(fn: (r) => r[\"_measurement\"] == \"containers\" or r[\"_measurement\"] == \"disk\" or "
            #             f"r[\"_measurement\"] == \"virtual_memory\")\n|> filter(fn: (r) => r[\"_field\"] == \"used\" or "
            #             f"r[\"_field\"] == \"total\" or r[\"_field\"] == \"status\" or r[\"_field\"] == \"percent\" or "
            #             f"r[\"_field\"] == \"name\" or r[\"_field\"] == \"memory_usage\" or r[\"_field\"] == \"image\" or "
            #             f"r[\"_field\"] == \"id\" or r[\"_field\"] == \"cpu_percentage\")\n"
            #          f"|> aggregateWindow(every: {resolution}, fn: last, createEmpty: false)\n|> yield(name:\"last\")"
            "query": f"from(bucket: \"{host}\")\n"
                     f"|> range(start: {start})\n"
                     f"|> filter(fn: (r) => r[\"_measurement\"] == \"containers\" or r[\"_measurement\"] == \"disk\" or "
                     f"r[\"_measurement\"] == \"virtual_memory\")\n|> aggregateWindow(every: {resolution}, "
                        f"fn: last, createEmpty: false)\n|> yield(name:\"last\")"
        }
    )

    csv_data = response.content.decode(ENCODING)
    print(csv_data)
    reader = csv.DictReader(io.StringIO(csv_data))
    json_data = []
    for row in reader:
        json_data.append(row)
    print(json_data)
    # print(list(reader))
    # json_data = eval(json.dumps(list(reader)))
    # print(json_data)

    return json_data
