# Setup Scripts

Automated scripts for SevaSetu platform setup and deployment.

## Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `install_dependencies.ps1` | Install all Python/Node packages | `.\install_dependencies.ps1` |
| `setup_database.py` | Create tables and seed data | `python setup_database.py --seed` |
| `train_ai_model.py` | Generate data and train ML model | `python train_ai_model.py` |
| `start_all.ps1` | Start all 6 services | `.\start_all.ps1` |

## Quick Start

```powershell
# 1. Install dependencies
.\scripts\install_dependencies.ps1

# 2. Setup database with test data
python scripts\setup_database.py --seed

# 3. Train AI model
python scripts\train_ai_model.py

# 4. Start all services
.\scripts\start_all.ps1
```

## Detailed Usage

### install_dependencies.ps1

Installs all required packages for:
- 4 backend services (FastAPI, SQLAlchemy, scikit-learn, etc.)
- 2 frontend apps (React, dependencies)

**Prerequisites:**
- Python 3.9+
- Node.js 16+

### setup_database.py

**Options:**
- `--seed` : Create test data (4 caregivers, 3 civilians, ratings)
- `--reset` : Drop all tables and recreate (requires confirmation)

**Examples:**
```bash
# Create tables only
python setup_database.py

# Create tables and seed data
python setup_database.py --seed

# Reset database (deletes all data)
python setup_database.py --reset --seed
```

### train_ai_model.py

Generates 1000 synthetic training samples and trains RandomForestRegressor.

**Output:**
- `caregiver_training_data.csv` (1000 samples)
- `caregiver_matcher_model.pkl` (trained model)

### start_all.ps1

Starts all services in separate PowerShell windows.

**Services started:**
1. Caregiver API → Port 8001
2. Civilian API → Port 8002
3. AI Service → Port 8003
4. Safety Service → Port 8005
5. Civilian App → Port 3000
6. Caregiver App → Port 3001

**Stop services:** Press Ctrl+C in each terminal window

## Database Schema

After running `setup_database.py --seed`:

**Caregivers (4):**
- ID 1: Sarah Johnson (elderly care, verified)
- ID 2: Michael Chen (physiotherapy, verified)
- ID 3: Priya Sharma (wound care, verified)
- ID 4: David Williams (companionship, unverified)

**Civilians (3):**
- ID 1-3: Test users with guardian contacts

**Ratings (3):**
- Sample ratings for caregivers 1-2

## Troubleshooting

### PowerShell Execution Policy

If scripts don't run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Connection

Edit `services/shared/config.py`:
```python
DATABASE_URL = "postgresql://sevasetu_user:sevasetu_pass@localhost/sevasetu_db"
```

### Port Conflicts

If ports are in use, edit the port in respective `main.py` files or kill processes:
```powershell
# Find process on port
netstat -ano | findstr :8001

# Kill process
taskkill /PID <process_id> /F
```
