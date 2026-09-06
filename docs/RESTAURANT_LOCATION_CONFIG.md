# QuickServe Restaurant Location Deployment Guide

This document describes how to deploy and configure QuickServe for different restaurant locations without changing any Java source code.

---

## Configuration Overview

The backend location security system validates that customers are physically inside the restaurant before allowing them to access table claiming, placing orders, and service requests.

Location properties are defined in `backend/src/main/resources/application.properties`:

```properties
restaurant.location.latitude=${RESTAURANT_LATITUDE:16.5062}
restaurant.location.longitude=${RESTAURANT_LONGITUDE:80.6480}
restaurant.location.radius-meters=${RESTAURANT_RADIUS_METERS:100}
```

### Environment Variables

| Variable | Description | Default (Dev) |
|---|---|---|
| `RESTAURANT_LATITUDE` | Latitude of the restaurant in decimal degrees | `16.5062` |
| `RESTAURANT_LONGITUDE` | Longitude of the restaurant in decimal degrees | `80.6480` |
| `RESTAURANT_RADIUS_METERS` | Allowed customer radius in metres | `100` |

---

## Deployment Examples

### Restaurant A (e.g. Hyderabad Downtown)
```bash
export RESTAURANT_LATITUDE=17.4485
export RESTAURANT_LONGITUDE=78.3748
export RESTAURANT_RADIUS_METERS=100
java -jar backend.jar
```

### Restaurant B (e.g. Bangalore Whitefield)
```bash
export RESTAURANT_LATITUDE=12.9716
export RESTAURANT_LONGITUDE=77.5946
export RESTAURANT_RADIUS_METERS=120
java -jar backend.jar
```

### Docker Compose Example
```yaml
services:
  backend:
    image: quickserve-backend:latest
    environment:
      - RESTAURANT_LATITUDE=17.4485
      - RESTAURANT_LONGITUDE=78.3748
      - RESTAURANT_RADIUS_METERS=100
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/quickserve
      - SPRING_DATASOURCE_USERNAME=<your-database-username>
      - SPRING_DATASOURCE_PASSWORD=<your-database-password>
      - APP_JWT_SECRET=<your-jwt-secret-min-256-bits>
      - QUICKSERVE_OWNER_PASSWORD=<your-owner-password>
    ports:
      - "8080:8080"
```

---

## Zero Code Changes

Production deployments never require modifying Java files or rebuilding JAR files. Simply provide the environment variables at container or process startup. If no environment variables are set, the system falls back to the safe development defaults.
