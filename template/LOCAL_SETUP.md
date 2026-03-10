# Localhost Setup (Backend + Frontend + bini.sql)

## 1) MySQL database import

Use the root SQL dump file from this repo:
- `bini.sql`

Command (if `mysql` is in PATH):

```powershell
mysql -u root -p < bini.sql
```

If you use XAMPP and `mysql` is not in PATH:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -p < bini.sql
```

`bini.sql` already contains:
- `CREATE DATABASE IF NOT EXISTS bini`
- `USE bini`

## 2) Backend environment

Configured in `Backend/.env`:
- `PORT=4000`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=` (empty by default)
- `DB_NAME=bini`
- `SINGLE_DB_MODE=1`

If your MySQL uses another password/port, update `Backend/.env`.

## 3) Frontend environment

Configured in `Frontend/.env`:
- `VITE_API_URL=http://localhost:4000/v1`
- `VITE_ADMIN_API_URL=http://localhost:4000/v1`
- `VITE_ECOMMERCE_API_URL=http://localhost:4000/v1`

## 4) Run backend

```powershell
cd Backend
npm run dev
```

Health check:

```powershell
curl.exe -i "http://localhost:4000/health"
```

Expected JSON includes:
- `"status":"OK"`
- `"app_db":"bini"`

## 5) Run frontend

Open a new terminal:

```powershell
cd Frontend
npm run dev
```

Open:
- `http://localhost:5173`

