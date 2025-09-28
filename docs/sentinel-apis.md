# Sentinel Monitoring API Guide

Sentinel provides REST APIs for managing monitored spaces, data series, and automated health checks. This guide summarizes the current endpoints and configuration options that integrate with Aquarius AI Copilot Agent orchestration flows.

## Base URL

All examples assume the Sentinel service is hosted at `https://localhost:9000/`.

## Endpoint Catalog

| Endpoint | Method | Description |
| --- | --- | --- |
| `/v1/api/` | GET | Retrieve a catalog of supported Sentinel endpoints. |
| `/v1/api/user/` | POST | Create a new Sentinel user (admin token required). |
| `/v1/api/user/{id}` | GET | Fetch profile data for an existing user. |
| `/v1/api/space/` | POST | Create a monitored space owned by a user. |
| `/v1/api/series/` | POST | Register a metric series within a space. |
| `/v1/api/key/{id}` | GET | Recover an API key for a given user. |
| `/v1/api/endpoint` | GET | Retrieve connection details for sending data streams. |
| `/v1/dashboard/` | GET | Embed the Grafana dashboard HTML iframe. |
| `/v1/api/pingback/` | POST | Register a pingback (health check) definition. |
| `/v1/api/pingback/{id}` | GET | Retrieve pingback configuration and history. |

## Return Codes at a Glance

| Endpoint | Verb | Return Codes | Notes |
| --- | --- | --- | --- |
| `/v1/api/` | GET | `200`, `500` | `200` if service is healthy. |
| `/v1/api/user/` | POST | `201`, `400`, `401`, `409`, `500` | Admin token required. |
| `/v1/api/user/{id}` | GET | `200`, `400`, `401` | API key required. |
| `/v1/api/space/` | POST | `201`, `400`, `401`, `409`, `500` | Requires username and API key. |
| `/v1/api/series/` | POST | `201`, `400`, `401`, `409`, `500` | Requires username and API key. |
| `/v1/api/key/{id}` | GET | `200`, `400`, `401` | Requires username and password headers. |
| `/v1/api/endpoint` | GET | `200`, `401` | Requires username and API key. |
| `/v1/dashboard/` | GET | `200`, `500` | Grafana handles authentication. |
| `/v1/api/pingback/` | POST | `201`, `400`, `401`, `500` | Requires username and API key. |
| `/v1/api/pingback/{id}` | GET | `200`, `401` | Requires username and API key. |

## Required Headers

| Header | Purpose |
| --- | --- |
| `Content-Type: application/json` | Default for request bodies. |
| `x-auth-token` | Admin master token for privileged actions. |
| `x-auth-password` | Password for the target user (API key recovery). |
| `x-auth-login` | Username or user ID associated with the request. |
| `x-auth-apikey` | User API key for authenticated endpoints. |

## Example Requests

### Service Health

```bash
curl -X GET https://localhost:9000/v1/api/
```

### Create a User (Admin Only)

```bash
curl -X POST https://localhost:9000/v1/api/user/ \
  --header "Content-Type: application/json" \
  --header "x-auth-token: <admin-token>" \
  --data '{"login":"username","password":"some-password"}'
```

### Register a Space

```bash
curl -X POST https://localhost:9000/v1/api/space/ \
  --header "Content-Type: application/json" \
  --header "x-auth-login: username" \
  --header "x-auth-apikey: some-api-key" \
  --data '{"name":"space-name"}'
```

### Register a Series within a Space

```bash
curl -X POST https://localhost:9000/v1/api/series/ \
  --header "Content-Type: application/json" \
  --header "x-auth-login: username" \
  --header "x-auth-apikey: some-api-key" \
  --data '{"name":"series-name","spaceName":"parent-space-name","msgSignature":"unixtime:s msgtype:json"}'
```

### Configure a Pingback Health Check

```bash
curl -X POST https://localhost:9000/v1/api/pingback/ \
  --header "Content-Type: application/json" \
  --header "x-auth-login: username" \
  --header "x-auth-apikey: some-api-key" \
  --data '{
    "pingURL": "some-service-endpoint",
    "reportURL": "some-reporting-endpoint",
    "periodicity": 30000,
    "toleranceFactor": 2,
    "method": "body,status,up"
  }'
```

## Docker Compose Support

Sentinel ships with a `docker-compose.yml` (located under `docker-support/`) that provisions the following services:

- Grafana (`grafana/grafana:4.6.1`)
- InfluxDB (`influxdb:1.2.4-alpine`)
- Java 8 runtime (`rolvlad/alpine-oraclejdk8`)
- Kafka (`spotify/kafka:latest`)

Launch the full stack with:

```bash
cd docker-support
docker-compose up
```

### Key Environment Variables

```text
STREAM_ADMINUSER=root
STREAM_ADMINPASS=pass1234
STREAM_DBENDPOINT=influxdb:8086
STREAM_ACCESSURL=localhost:8083
STREAM_DBTYPE=influxdb
ZOOKEEPER_ENDPOINT=kafka:2181
KAFKA_ENDPOINT=kafka:9092
TOPIC_CHECK_INTERVAL=30000
INFLUX_URL=http://influxdb:8086
INFLUX_URL_GRAFANA=http://localhost:8086
GRAFANA_URL=http://grafana:3000
GRAFANA_ADMIN=admin
GRAFANA_PASSWORD=1ccl@b2017
INFLUX_USER=root
INFLUX_PASSWORD=pass1234
SENTINEL_DB_ENDPOINT=/data/sentinel.db
ADMIN_TOKEN=somevalue
DASHBOARD_TITLE=elastest
DASHBOARD_ENDPOINT=localhost:3000
```

Adjust these values for production deployments, especially database credentials, Kafka endpoints, and public hostnames.

## Kafka Container Configuration

The Kafka container accepts the following overrides:

```text
ADVERTISED_PORT=9092
ADVERTISED_HOST=kafka
```

Ensure `ADVERTISED_HOST` points to a resolvable host or IP accessible by external clients.

## Building from Source

Sentinel is written in Java (tested with Oracle JDK 8) and built with Maven 3.0.5+.

```bash
mvn clean package
java -jar target/sentinel-0.1.jar
```

To load a custom configuration file, specify the path using `--spring.config.location`:

```bash
java -jar target/sentinel-0.1.jar --spring.config.location=/path/to/application.properties
```

## Configuration Reference

Important properties from `application.properties` include:

```text
spring.mvc.throw-exception-if-no-handler-found=true
logging.file=sentinel.log
server.port=9000
server.ssl.enabled=true
server.ssl.key-store=keystore.p12
server.ssl.key-store-password=pass1234
sentinel.db.type=sqlite
sentinel.db.endpoint=sentinel.db
kafka.endpoint=localhost:9092
kafka.key.serializer=StringSerializer
kafka.value.serializer=StringSerializer
zookeeper.endpoint=localhost:2181
topic.check.interval=30000
stream.dbtype=influxdb
stream.dbendpoint=localhost:8086
stream.accessurl=localhost:8083
stream.adminuser=root
stream.adminpass=1ccl@b2017
admin.token=eedsR2v5n4uh7Gjy
dashboard.title=elastest
dashboard.endpoint=localhost:3000
```

Review and harden these values (ports, credentials, SSL settings) before deploying Sentinel in production environments.

## Next Steps

- Provision Sentinel alongside Aquarius AI Copilot Agent via Docker Compose for local testing.
- Store API keys and admin tokens securely (e.g., Vercel encrypted env vars or HashiCorp Vault).
- Implement entitlement checks using Sentinel series metadata when building new Aquarius automation flows.
