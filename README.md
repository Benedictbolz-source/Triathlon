# Triathlon Training Plan Dashboard

Modernes Triathlon-Dashboard mit Strava-Integration, Trainingsplan-Generator und KPI-Overview.

## Features (MVP)
- Strava OAuth2 (Authorization Code Flow) via NextAuth
- Synchronisierung der letzten 90 Tage (Pagination)
- Normalisierte Einheiten & KPI-Aggregationen
- Plan-Generator (12–20 Wochen) mit periodisiertem Aufbau
- Responsive UI mit Light/Dark Mode

## Setup

```bash
npm install
npm run prisma:generate
npm run dev
```

### Datenbank
- PostgreSQL in Production, SQLite möglich für lokale Entwicklung.
- Setze `DATABASE_URL` entsprechend (z. B. `file:./dev.db` für SQLite).

```bash
npm run prisma:migrate
```

## Environment Variablen
Siehe `.env.example`.

| Variable | Beschreibung |
| --- | --- |
| `DATABASE_URL` | Prisma Datenbank-URL |
| `NEXTAUTH_URL` | Basis-URL der App |
| `NEXTAUTH_SECRET` | Session-Secret |
| `STRAVA_CLIENT_ID` | Strava OAuth Client ID |
| `STRAVA_CLIENT_SECRET` | Strava OAuth Client Secret |
| `ENCRYPTION_KEY` | Schlüssel zur Token-Verschlüsselung |

## Strava Setup

1. Erstelle eine Strava App: https://www.strava.com/settings/api
2. Redirect URI:
   - `http://localhost:3000/api/auth/callback/strava`
3. Scopes:
   - `read` (Profil & Basisdaten)
   - `activity:read_all` (Historische Aktivitäten für 90 Tage+)

### Token Refresh Ablauf
- Tokens werden serverseitig gespeichert (`StravaConnection`), verschlüsselt mit `ENCRYPTION_KEY`.
- `refresh_token` wird automatisch genutzt, sobald `expiresAt` erreicht ist (`lib/strava.ts`).

## Architektur

```
/app                # App Router routes & API handlers
/components         # UI & Domain Komponenten
/lib                # Strava Client, Plan Generator, Units
/prisma             # Prisma schema + migrations
/schemas            # Zod Validation
/types              # TypeScript types
/styles             # Tailwind CSS
```

## Hinweise für Erweiterungen
- Trainingsbelastung (TSS) kann über HR-Zonen, Power oder RPE präziser berechnet werden (siehe `lib/units.ts`).
- Activity Matching (`CompletedLink`) kann mit Zeitfenster + Distanz-Ähnlichkeit verbessert werden.

