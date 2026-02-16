# SevaSetu - Caregiving Platform MVP

A production-grade dual-entity caregiving platform with AI matching, blockchain reputation, and safety monitoring.

## Architecture

### Services
- **caregiver-api** (Port 8001): Caregiver registration, availability, job management
- **civilian-api** (Port 8002): Care requests, matching, bookings, ratings
- **ai-service** (Port 8003): ML-powered caregiver matching using scikit-learn
- **blockchain-service**: Solidity smart contract for privacy-preserving ratings
- **safety-service** (Port 8005): Anomaly detection and guardian live mode

### Frontend
- **civilian-app** (Port 3000): React app for care requests
- **caregiver-app** (Port 3001): React dashboard for caregivers

## Tech Stack

### Backend
- Python FastAPI  
- PostgreSQL + SQLAlchemy
- scikit-learn (RandomForestRegressor)
- Web3.py (Blockchain)

### Frontend
- React 18
- Fetch API for HTTP requests

## Setup (Manual)

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL
- (Optional) Local blockchain node for smart contract

### Backend Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE sevasetu_db;
   CREATE USER sevasetu_user WITH PASSWORD 'sevasetu_pass';
   GRANT ALL PRIVILEGES ON DATABASE sevasetu_db TO sevasetu_user;
   ```

2. Install dependencies for each service:
   ```bash
   cd services/caregiver-api && pip install -r requirements.txt
   cd services/civilian-api && pip install -r requirements.txt
   cd services/ai-service && pip install -r requirements.txt
   cd services/safety-service && pip install -r requirements.txt
   ```

3. Train AI model:
   ```bash
   cd services/ai-service/model
   python train.py
   ```

4. Start services:
   ```bash
   # Terminal 1
   python services/caregiver-api/main.py

   # Terminal 2
   python services/civilian-api/main.py

   # Terminal 3
   python services/ai-service/main.py

   # Terminal 4
   python services/safety-service/main.py
   ```

### Frontend Setup

1. Install and run civilian app:
   ```bash
   cd frontend/civilian-app
   npm install
   npm start
   ```

2. Install and run caregiver app:
   ```bash
   cd frontend/caregiver-app
   npm install
   npm start
   ```

## Testing

Run integration tests:
```bash
cd tests
pytest integration/test_full_flow.py -v
```

## API Endpoints

### Caregiver API (8001)
- `POST /caregiver/register` - Register new caregiver
- `POST /caregiver/availability` - Update availability
- `GET /caregiver/{id}` - Get caregiver profile
- `GET /caregiver/jobs` - Get assigned jobs

### Civilian API (8002)
- `POST /civilian/request-care` - Submit care request
- `POST /civilian/match-caregivers` - Get AI-matched caregivers
- `POST /civilian/confirm-booking` - Confirm booking
- `POST /civilian/submit-rating` - Rate caregiver

### AI Service (8003)
- `POST /rank` - Rank caregivers by match score

### Safety Service (8005)
- `POST/monitor/analyze` - Analyze monitoring data
- `POST /guardian/session/start` - Start guardian session
- `POST /guardian/session/end` - End guardian session

## Key Features

✅ **AI Matching**: RandomForestRegressor ranks caregivers by skill match, experience, ratings, and location  
✅ **Trust Score**: Deterministic weighted formula (verification + ratings + experience - penalties)  
✅ **Blockchain**: Privacy-preserving Solidity contract for immutable ratings  
✅ **Safety Monitoring**: Threshold-based anomaly detection stub  
✅ **Guardian Mode**: WebRTC session management for live monitoring  
✅ **Minimal UI**: Functional React components with fetch API

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed folder layout.

## Notes

- No authentication implemented (add JWT in production)
- Blockchain requires external node (Ganache/Hardhat for testing)
- WebRTC video streaming is P2P (backend only manages sessions)
- AI model uses synthetic data (replace with historical data in production)

## License

MIT
