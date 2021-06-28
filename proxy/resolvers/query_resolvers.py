from utils import INFLUXDB_TOKEN, ENCODING
import requests
import csv
import io


# fetches all stats in bucket (host) form InfluxDB
# https://docs.influxdata.com/influxdb/v2.0/api/#operation/PostQuery
# https://docs.influxdata.com/influxdb/v2.0/query-data/execute-queries/influx-api/
def fetch_stats_for_host(host, org='agh-utc', start="-2d", resolution="10s"):
    response = requests.post(
        url=f'http://influxdb:8086/api/v2/query?org={org}',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        },
        json={
            "query": f"from(bucket: \"{host}\")\n"
                     f"|> range(start: {start})\n"
                     f"|> filter(fn: (r) => r[\"_measurement\"] == \"containers\" or r[\"_measurement\"] == \"disk\" or "
                     f"r[\"_measurement\"] == \"virtual_memory\")\n|> aggregateWindow(every: {resolution}, "
                        f"fn: last, createEmpty: false)\n|> last()\n|> yield(name:\"last\")"
        }
    )

    csv_data = response.content.decode(ENCODING)
    reader = csv.DictReader(io.StringIO(csv_data))
    json_data = []
    for row in reader:
        json_data.append(row)

    return json_data
