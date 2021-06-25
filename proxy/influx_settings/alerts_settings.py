from utils import INFLUXDB_TOKEN, ENCODING
import requests
import json
import time


class SettingsProvider:
    def __init__(self):
        self.organization_id = None
        self.endpoint_id = None
    
    def get_organization_id(self):
        response = requests.get(
            url='http://influxdb:8086/api/v2/orgs',
            headers={
                'Authorization': f'Token {INFLUXDB_TOKEN}'
            }
        )

        if not response.ok:
            raise ValueError

        result = json.loads(response.content.decode(ENCODING))
        organizations = result["orgs"]
        
        if len(organizations) != 1:
            raise ValueError
        
        self.organization_id = organizations[0]["id"]

    def setup_notification_endpoint(self):
        response = requests.post(
            url='http://influxdb:8086/api/v2/notificationEndpoints',
            headers={
                'Authorization': f'Token {INFLUXDB_TOKEN}'
            },

            json={
                "authMethod": "none",
                "method": "POST",
                "name": "proxy-hook",
                "type": "http",
                "url": "http://proxy:5000/hook/notifications",
                "status": "active",
                "orgID": self.organization_id
            }
        )

        if not response.ok:
            raise ValueError

        result = json.loads(response.content.decode(ENCODING))
        self.endpoint_id = result["id"]

    def setup_crit_rule(self):
        response = requests.post(
            url='http://influxdb:8086/api/v2/notificationRules',
            headers={
                'Authorization': f'Token {INFLUXDB_TOKEN}'
            },

            json={
                "type":"http",
                "every":"5s",
                "offset":"0s",
                "orgID": self.organization_id,
                "name":"crit-rule",
                "activeStatus":"active",
                "status":"active",
                "endpointID": self.endpoint_id,
                "statusRules":[
                    {
                        "currentLevel":"CRIT"
                    }
                ]    
            }
        )

        if not response.ok:
            raise ValueError

        return

    def setup_warn_rule(self):
        response = requests.post(
            url='http://influxdb:8086/api/v2/notificationRules',
            headers={
                'Authorization': f'Token {INFLUXDB_TOKEN}'
            },

            json={
                "type":"http",
                "every":"5s",
                "offset":"0s",
                "orgID": self.organization_id,
                "name":"warn-rule",
                "activeStatus":"active",
                "status":"active",
                "endpointID": self.endpoint_id,
                "statusRules":[
                    {
                        "currentLevel":"CRIT"
                    }
                ]    
            }
        )

        if not response.ok:
            raise ValueError            

        

