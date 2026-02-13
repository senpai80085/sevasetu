# SevaSetu Design Document

## 1. Purpose
SevaSetu is a dual-sided caregiving platform MVP connecting civilians who need care and caregivers who provide care. The system is designed around modular backend services, two focused frontend apps, and supporting trust/safety capabilities (AI ranking, trust score/blockchain recording, and live safety monitoring).

This document describes the system’s design at the product and technical architecture level, including component boundaries, data flow, and key tradeoffs.

---

## 2. Design Goals

1. **Separation of concerns via microservices**
   - Keep caregiver workflows, civilian workflows, AI ranking, and safety monitoring independently deployable.
2. **Trust-aware matching**
   - Combine profile data, ratings, and experience to rank caregivers and improve booking confidence.
3. **Safety-first operations**
   - Provide anomaly detection and guardian session support for active care scenarios.
4. **MVP pragmatism**
   - Prioritize straightforward APIs and simple data contracts to enable fast iteration.
5. **Extensibility**
   - Allow future evolution toward stronger auth, richer matching models, and production-grade infra.

---

## 3. System Context

### Primary user personas
- **Civilian (care requester)**: submits care requests, reviews matched caregivers, books care, and submits ratings.
- **Caregiver (service provider)**: maintains profile/availability, receives assignments, and builds trust history.
- **Guardian/Safety stakeholders**: monitor ongoing sessions and respond to safety anomalies.

### External/adjacent systems
- Local or managed **database** for transactional app data.
- Optional **blockchain node** for trust passport rating persistence.
- Browser clients for each role-specific frontend.

---

## 4. High-Level Architecture

### Backend services
- **caregiver-api (FastAPI, port 8001)**
  - Caregiver registration/profile management.
  - Availability toggling and job retrieval.

- **civilian-api (FastAPI, port 8002)**
  - Care request intake.
  - Calls AI service for ranking support.
  - Booking confirmation and rating submission workflows.

- **ai-service (FastAPI, port 8003)**
  - ML ranking endpoint.
  - RandomForest-based inference from trained model artifacts.

- **safety-service (FastAPI, port 8005)**
  - Monitoring analysis endpoints.
  - Guardian session lifecycle endpoints (start/end).

- **blockchain-service (scripts + Solidity contract)**
  - TrustPassport contract and helper scripts.
  - Writes/retrieves immutable rating records (where configured).

### Shared backend module
- **services/shared**
  - Common DB config and models.
  - Trust/security/payment helper modules.

### Frontend applications
- **frontend/civilian-app (React)**
  - Civilian journey: login → request care → match review → booking → session/rating/history.

- **frontend/caregiver-app (React)**
  - Caregiver journey: login/profile setup → availability → job requests/assigned jobs/trust passport.

---

## 5. Core Workflow Design

### 5.1 Civilian booking flow
1. Civilian submits a care request in civilian-app.
2. civilian-api validates and prepares matching input.
3. civilian-api requests ranking from ai-service (`/rank`).
4. Ranked caregivers returned to civilian UI.
5. Civilian confirms booking.
6. Booking is persisted; caregiver can view assigned jobs.
7. After completion, civilian submits rating.
8. Rating contributes to trust calculations and may be mirrored to blockchain scripts/contract.

### 5.2 Caregiver operations flow
1. Caregiver registers profile via caregiver-api.
2. Caregiver updates availability status.
3. Caregiver dashboard retrieves pending/assigned work.
4. Trust passport view displays trust-related profile and rating signals.

### 5.3 Safety/guardian flow
1. Active monitoring payload is sent to safety-service (`/monitor/analyze`).
2. Service computes anomaly state from rule/threshold logic.
3. Guardian session is started/ended through dedicated endpoints.
4. Alert/event data can be surfaced to operational dashboards or future notification channels.

---

## 6. Data Design (Conceptual)

### Main entities
- **Caregiver**: identity, skills, verification status, availability, experience, location.
- **Civilian**: identity and request context.
- **Booking**: relationship between civilian and caregiver with schedule/status metadata.
- **Rating**: post-service feedback driving quality/trust metrics.
- **Audit/Identity adjuncts**: optional records for compliance/history.

### Data boundaries
- Transactional entities are centralized through shared model definitions.
- AI model training/inference data is handled inside ai-service model package.
- Blockchain trust records are treated as append-only externalized artifacts.

---

## 7. API Design Principles

1. **Role-oriented API surfaces**: civilian and caregiver APIs map directly to user journeys.
2. **Small, explicit endpoints**: each operation has narrow responsibility.
3. **Service composition**: civilian-api composes AI ranking rather than embedding ML logic directly.
4. **Future auth compatibility**: routes are structured so JWT/role-based auth can be layered in.

---

## 8. AI Matching Design

- Model type: **RandomForestRegressor** (MVP baseline).
- Training: local scripts in `ai-service/model` with synthetic data generation.
- Inference: exposed by ai-service route(s) for ranking caregiver candidates.
- Rationale:
  - Handles mixed features reasonably well for MVP.
  - Robust baseline without complex feature engineering.
- Limitations:
  - Synthetic training data can misrepresent production distributions.
  - Explainability and fairness controls are minimal in current form.

---

## 9. Trust and Reputation Design

- **Application-level trust scoring** combines verification, ratings, and experience signals.
- **Blockchain trust passport** provides optional immutable rating ledgering.
- Design intent:
  - Keep core app functional without mandatory blockchain runtime.
  - Enable verifiable reputation extension for deployments that need auditability.

---

## 10. Safety Design

- Monitoring service evaluates session indicators for anomaly detection.
- Guardian session lifecycle is explicit (`start`/`end`) to support incident boundaries.
- Current implementation favors deterministic thresholds and lightweight session tracking.
- Future evolution:
  - Event streaming and real-time notifications.
  - Richer ML-based risk scoring.
  - Escalation policies integrated with external communication systems.

---

## 11. Security and Compliance Considerations

- Present architecture includes shared JWT/auth utilities but full auth enforcement is incomplete in MVP.
- Recommended production hardening:
  1. Mandatory authentication and role-based authorization at all protected routes.
  2. Encrypted secrets management and strict CORS policy.
  3. PII minimization and retention controls for user/session data.
  4. Auditable access logging and tamper-evident operational records.

---

## 12. Deployment & Operations Design (MVP)

- Independent service processes allow staged startup and local debugging.
- Frontends are separately runnable, enabling role-focused demos.
- Integration tests exercise end-to-end scenarios across service boundaries.
- For productionization, prefer:
  - Containerized deployment per service.
  - Managed DB and observability stack.
  - CI pipeline with contract and integration test gates.

---

## 13. Key Tradeoffs

1. **Microservices vs operational simplicity**
   - Chosen for modularity; increases deployment coordination.
2. **Synthetic-data ML vs realistic quality**
   - Fast to bootstrap; weaker real-world performance guarantees.
3. **Optional blockchain integration**
   - Flexible rollout; introduces multi-environment complexity when enabled.
4. **MVP security posture**
   - Accelerates feature delivery; requires explicit hardening before production.

---

## 14. Future Design Roadmap

1. Implement complete authN/authZ and tenancy boundaries.
2. Introduce async messaging for booking/safety events.
3. Replace synthetic data with real feedback loop and model monitoring.
4. Add observability: tracing, metrics dashboards, and SLO alerts.
5. Expand trust passport with verifiable credentials and dispute workflows.
6. Add robust accessibility and localization across both frontends.

---

## 15. Appendix: Service-to-Responsibility Mapping

| Component | Responsibility | Primary Consumers |
|---|---|---|
| caregiver-api | caregiver profile, availability, jobs | caregiver-app |
| civilian-api | request intake, booking, rating orchestration | civilian-app |
| ai-service | ranking caregivers | civilian-api |
| safety-service | anomaly analysis, guardian session control | civilian-app / ops tools |
| blockchain-service | immutable trust rating scripts/contract | civilian-api workflows / ops |
| shared module | common models/config/utilities | all backend services |

