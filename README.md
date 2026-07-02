# demo-app

Einfache Node.js/Express-Webanwendung, die jeden Seitenaufruf in einer PostgreSQL-Datenbank speichert und die Gesamtanzahl der Besuche anzeigt.

Dient als Beispielanwendung zum Vergleich von **CI/CD-** und **GitOps-Deployment** auf AWS EKS im Rahmen einer Bachelorarbeit.

## Stack

- **Node.js 22** + Express
- **PostgreSQL** (AWS RDS)
- **Docker** (Image: `ghcr.io/t-foerst/demo-app`)


## Endpoints

| Endpoint  | Beschreibung                              |
|-----------|-------------------------------------------|
| `GET /`   | Zeigt Besuchszähler                       |
| `GET /healthz` | Health Check (prüft DB-Verbindung)   |

## Lokal starten

```bash
npm install
DB_HOST=... DB_PORT=5432 DB_NAME=... DB_USER=... DB_PASSWORD=... npm start
```

## CI/CD Pipeline

Bei jedem Push auf `main` wird automatisch:
1. Docker Image gebaut und nach GHCR gepusht (`ghcr.io/t-foerst/demo-app:<sha>`)
2. Deployment auf EKS im Namespace `demo-app-cicd` ausgerollt
