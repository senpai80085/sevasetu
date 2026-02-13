# SevaSetu - Caregiving Platform
## Monorepo Folder Structure

```
SevaSetu/
│
├── services/
│   ├── shared/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── caregiver.py
│   │   │   ├── civilian.py
│   │   │   ├── booking.py
│   │   │   └── rating.py
│   │   ├── database.py
│   │   └── config.py
│   │
│   ├── caregiver-api/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── caregiver.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── caregiver.py
│   │   └── requirements.txt
│   │
│   ├── civilian-api/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── civilian.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── civilian.py
│   │   └── requirements.txt
│   │
│   ├── ai-service/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── model/
│   │   │   ├── __init__.py
│   │   │   ├── train.py
│   │   │   ├── predict.py
│   │   │   └── synthetic_data.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── matching.py
│   │   └── requirements.txt
│   │
│   ├── blockchain-service/
│   │   ├── contracts/
│   │   │   └── TrustPassport.sol
│   │   ├── scripts/
│   │   │   ├── __init__.py
│   │   │   ├── submit_rating.py
│   │   │   └── get_ratings.py
│   │   └── requirements.txt
│   │
│   └── safety-service/
│       ├── __init__.py
│       ├── main.py
│       ├── monitor/
│       │   ├── __init__.py
│       │   └── anomaly_detection.py
│       ├── guardian/
│       │   ├── __init__.py
│       │   └── webrtc_session.py
│       └── requirements.txt
│
├── frontend/
│   ├── civilian-app/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.js
│   │   │   ├── index.js
│   │   │   ├── pages/
│   │   │   │   ├── RequestCare.js
│   │   │   │   ├── MatchedCaregivers.js
│   │   │   │   ├── ConfirmBooking.js
│   │   │   │   └── SubmitRating.js
│   │   │   └── components/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── caregiver-app/
│       ├── public/
│       ├── src/
│       │   ├── App.js
│       │   ├── index.js
│       │   ├── pages/
│       │   │   ├── RegisterProfile.js
│       │   │   ├── ToggleAvailability.js
│       │   │   ├── AssignedJobs.js
│       │   │   └── TrustPassport.js
│       │   └── components/
│       ├── package.json
│       └── README.md
│
├── tests/
│   ├── __init__.py
│   ├── integration/
│   │   ├── __init__.py
│   │   └── test_full_flow.py
│   └── conftest.py
│
├── docs/
│   ├── architecture.md
│   ├── api_specs.md
│   └── deployment.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Directory Explanations

### services/
Root directory for all backend microservices

#### shared/
- Common database models and configurations
- Shared by all backend services
- Contains SQLAlchemy models for: Caregiver, Civilian, Booking, Rating

#### caregiver-api/
- FastAPI service for caregiver operations
- Handles registration, availability, job management

#### civilian-api/
- FastAPI service for civilian operations
- Handles care requests, matching, bookings, ratings

#### ai-service/
- ML-powered matching service using scikit-learn
- Trains and deploys RandomForestRegressor for caregiver ranking

#### blockchain-service/
- Solidity smart contract for trust passport
- Python web3 scripts for blockchain interactions

#### safety-service/
- Safety monitoring and anomaly detection
- Guardian live mode session management

### frontend/
Root directory for all React applications

#### civilian-app/
React application for civilians requesting care

#### caregiver-app/
React application for caregiver dashboard

### tests/
Integration and unit tests using pytest

### docs/
Project documentation and specifications
