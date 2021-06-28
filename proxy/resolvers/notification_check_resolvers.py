from utils import INFLUXDB_TOKEN, ENCODING
import requests
import json


def create_check_for_bucket(bucket, resource, org_id, min, max):
    response = requests.post(
        url='http://influxdb:8086/api/v2/checks',
        headers={
            'Authorization': f'Token {INFLUXDB_TOKEN}'
        },

        json={
            "name": f'{bucket};{resource}',
            "orgID": org_id,
            "query": {
                "text": f"from(bucket: \"{bucket}\")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r[\"_measurement\"] == \"{resource}\")\n  |> filter(fn: (r) => r[\"_field\"] == \"percent\")\n  |> aggregateWindow(every: 1s, fn: last, createEmpty: false)\n  |> yield(name: \"last\")",
                "editMode": "builder",
                "builderConfig": {
                    "buckets": [
                        bucket
                    ],
                    "tags": [
                        {
                            "key": "_measurement",
                            "values": [
                                resource
                            ],
                            "aggregateFunctionType": "filter"
                        },
                        {
                            "key": "_field",
                            "values": [
                                "percent"
                            ],
                            "aggregateFunctionType": "filter"
                        }
                    ],
                    "functions": [
                        {
                            "name": "last"
                        }
                    ],
                    "aggregateWindow": {
                        "period": "1s",
                        "fillValues": False
                    }
                }
            },
            "statusMessageTemplate": "${ r._check_name };${ r._level };${ string(v: r.percent) }",
            "every": "1s",
            "offset": "0s",

            "thresholds": [
                {
                    "allValues": False,
                    "level": "OK",
                    "value": min + 1,
                    "type": "lesser"
                },
                {
                    "allValues": False,
                    "level": "WARN",
                    "min": min,
                    "max": max,
                    "within": True,
                    "type": "range"
                },
                {
                    "allValues": False,
                    "level": "CRIT",
                    "value": max - 1,
                    "type": "greater"
                }
            ],
            "type": "threshold",
            "status": "active"
        }

    )

    if not response.ok:
        raise ValueError(response)