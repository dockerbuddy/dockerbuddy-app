# Docker Buddy

## Running app with docker
Docker repository - TODO
```
docker run --name dockerbuddy --env-file .env -p 8080:8080 -d dockerbuddy
```

See [Environment variables](#environment-variables).
### Requirements
- Docker (duh)



## Runing app with jar file
You can run application without docker with jar file
```
java -jar dockerbuddy.jar
```
See [Environment variables](#environment-variables).
### Requirements
- java 11
- ???  

## Environment variables
We are using some environment variables - mostly for connection with influx
- `INFLUXDB_URL` - influx URL
- `INFLUXDB_USERNAME` - influx username
- `INFLUXDB_PASSWORD` - influx password
- `INFLUXDB_ORGANIZATION` - influx organization
- `INFLUXDB_ADMIN_TOKEN` - influx admin token
- `INFLUXDB_BUCKET` - bucket for storing metrics and alerts


## Realease
For realeasing we are using bash script `build.sh`.
### Requirements
- Apache Maven 3.8.3
- Yarn 1.22.10
- Docker
- ???
### Artifacts
Bash script is creating a jar file in `backend/target` which is containing both backend and frontend. It also creates a docker image `dockerbuddy`.

