# Docker Buddy
Hi I'm your Docker Buddy - Buddy for everybody
## Running app with docker
Image of Docker Buddy is available on [DockerHub](https://hub.docker.com/repository/docker/kraleppa/dockerbuddy)
```
docker run --name dockerbuddy --env-file .env -p 8080:8080 -d kraleppa/dockerbuddy:v1.2.0-beta
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

## Running with docker-compose
Since Docker Buddy requires InflxuDB to work properly, we prepared docker-compose with example configuration [Link](https://github.com/agh-docker-monitoring/dockiera-app/blob/main/docker-compose-local.yml). 
```
docker-compose -f docker-compose-local up
```
Webapp may throw an exception associated with connection to influxdb - in this case you should run above command again (sometimes it doesn't work properly we are working on it)

## Environment variables
We are using some environment variables - mostly for connection with influx
- `INFLUXDB_URL` - influx URL
- `INFLUXDB_USERNAME` - influx username
- `INFLUXDB_PASSWORD` - influx password
- `INFLUXDB_ORGANIZATION` - influx organization
- `INFLUXDB_ADMIN_TOKEN` - influx admin token
- `INFLUXDB_BUCKET` - bucket for storing metrics and alerts


## Dev environment
You can run Docker Buddy locally using docker-compose
### Requirements
- Docker
- Yarn

### Steps
1. Generate `.env` file using `dev-env-generator.sh`. It creates random password and admin token for influx
2. `cd frontned/`
3. `yarn install`
4. `cd ..`
5. `docker-compose up`
6. Coffee break ☕

InfluxDB should be available on port `8086`
Backend should be available on port `8080`
Frontend should be available on port `3000`

You can login to influx using generated credentials from `.env` file

## Realease
For realeasing we are using bash script `build.sh`. You need to provide version as a first argument, for example:

`./build.sh 1.0.0`
### Requirements
- Apache Maven 3.8.3
- Yarn 1.22.10
- Docker
- ???
### Artifacts
Bash script is creating a jar file `dockerbuddy-verison` which is containing both backend and frontend. It also creates a docker image `dockerbuddy`.

