# SevaSetu - Complete Setup Guide

## Prerequisites

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **PostgreSQL 12+** ([Download](https://www.postgresql.org/download/))

## Quick Setup (5 minutes)

### 1. Database Setup

**Open psql and run:**
```sql
CREATE DATABASE sevasetu_db;
CREATE USER sevasetu_user WITH PASSWORD 'sevasetu_pass';
GRANT ALL PRIVILEGES ON DATABASE sevasetu_db TO sevasetu_user;
```

Or use command line:
```bash
psql -U postgres -c "CREATE DATABASE sevasetu_db;"
psql -U postgres -c "CREATE USER sevasetu_user WITH PASSWORD 'sevasetu_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sevasetu_db TO sevasetu_user;"
```

### 2. Install Dependencies

```powershell
.\scripts\install_dependencies.ps1
```

This will install all Python packages and Node.js modules for:
- 4 backend services
- 2 frontend apps

### 3. Initialize Database & Seed Test Data

```bash
python scripts\setup_database.py --seed
```

This creates:
- ✓ All database tables
- ✓ 4 test caregivers
- ✓ 3 test civilians
- ✓ Sample ratings

### 4. Train AI Model

```bash
python scripts\train_ai_model.py
```

Generates 1000 synthetic samples and trains the RandomForest model.

### 5. Start All Services

```powershell
.\scripts\start_all.ps1
```

Opens 6 terminal windows:
- Caregiver API (Port 8001)
- Civilian API (Port 8002)
- AI Service (Port 8003)
- Safety Service (Port 8005)
- Civilian App (Port 3000)
- Caregiver App (Port 3001)

---

## Access the Platform

**Civilian App:** http://localhost:3000  
**Caregiver App:** http://localhost:3001

### Test Login Data

**Caregivers (use IDs 1-4):**
- ID: 1, Name: Sarah Johnson (nursing, verified)
- ID: 2, Name: Michael Chen (physiotherapy, verified)
- ID: 3, Name: Priya Sharma (wound care, verified)
- ID: 4, Name: David Williams (companionship, unverified)

**Civilians (use IDs 1-3):**
- ID: 1, Name: John Smith
- ID: 2, Name: Mary Johnson
- ID: 3, Name: Robert Brown

---

## Manual Setup (Step-by-Step)

### Backend Services

```bash
# Install dependencies for each service
cd services/caregiver-api
pip install -r requirements.txt

cd ../civilian-api
pip install -r requirements.txt

cd ../ai-service
pip install -r requirements.txt

cd ../safety-service
pip install -r requirements.txt
```

### Frontend Apps

```bash
# Civilian app
cd frontend/civilian-app
npm install

# Caregiver app
cd ../caregiver-app
npm install
```

### Database Tables

```bash
python scripts/setup_database.py
```

### AI Model

```bash
cd services/ai-service/model
python train.py
```

### Start Services Manually

```bash
# Terminal 1
cd services/caregiver-api
python main.py

# Terminal 2
cd services/civilian-api
python main.py

# Terminal 3
cd services/ai-service
python main.py

# Terminal 4
cd services/safety-service
python main.py

# Terminal 5
cd frontend/civilian-app
npm start

# Terminal 6
cd frontend/caregiver-app
npm start
```

---

## Configuration

### Database Connection

Edit `services/shared/config.py`:
```python
DATABASE_URL = "postgresql://username:password@localhost/database_name"
```

### Service Ports

Default ports (can be changed in respective `main.py` files):
- Caregiver API: 8001
- Civilian API: 8002
- AI Service: 8003
- Safety Service: 8005
- Civilian App: 3000
- Caregiver App: 3001

---

## Troubleshooting

### Database Connection Error
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution:** Check PostgreSQL is running and credentials are correct.

### Port Already in Use
```
OSError: [WinError 10048] Only one usage of each socket address
```
**Solution:** Change port in service's `main.py` or kill process using the port.

### AI Model Not Found
```
FileNotFoundError: caregiver_matcher_model.pkl
```
**Solution:** Run `python scripts/train_ai_model.py`

### Node Modules Error
```
Error: Cannot find module 'react'
```
**Solution:** Run `npm install` in the frontend app directory.

---

## Reset Database

**⚠️ WARNING: Deletes all data**

```bash
python scripts/setup_database.py --reset --seed
```

---

## Running Tests

```bash
# Integration tests
cd tests/integration
pytest test_full_flow.py -v

# Demo reliability tests
pytest test_demo_fixes.py -v
```

---

## Production Deployment

See [Production Checklist](docs/DEMO_CHECKLIST.md) for deployment notes.

**Key changes for production:**
1. Use environment variables for secrets
2. Enable HTTPS/SSL
3. Add authentication (JWT)
4. Deploy blockchain contract
5. Setup Celery for async tasks
6. Configure CORS properly
7. Use production database (not SQLite)
8. Add monitoring/logging

---

## Support

- **Documentation:** See `docs/` folder
- **Implementation Details:** See `critical_fixes.md`
- **Walkthrough:** See `walkthrough.md`
