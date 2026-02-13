# Demo Reliability - Quick Reference

## Pre-Demo Checklist

### ✅ FIX 1: Booking Race Condition
**What changed:**
- Database index on `(caregiver_id, start_time, end_time)`
- Overlap detection in transaction
- Returns `HTTP 409 Conflict` if time slot unavailable

**Test:**
```bash
# Two concurrent bookings for same caregiver/time
# One should succeed (200), other should fail (409)
```

---

### ✅ FIX 2: AI Service Timeout
**What changed:**
- Timeout reduced from 10s → 800ms
- Catches `TimeoutException` + `HTTPError`
- Instant fallback to trust score ranking

**Test:**
```bash
# Stop AI service, make match request
# Should return in <1s with fallback ranking
curl -X POST http://localhost:8002/civilian/match-caregivers -d '{...}'
```

---

### ✅ FIX 3: Dynamic Trust Score
**What changed:**
- Recomputed on every `GET /caregiver/{id}`
- Reflects latest ratings + completed jobs

**Test:**
```bash
# Submit rating
curl -X POST .../submit-rating -d '{"caregiver_id":1, "rating":5.0}'

# Immediately fetch profile (trust score should update)
curl http://localhost:8001/caregiver/1
```

---

### ✅ FIX 4: Async Blockchain
**What changed:**
- API returns immediately
- `blockchain_status = "pending"`
- Background worker queued (TODO: Celery)

**Test:**
```bash
# Submit rating - should respond instantly
time curl -X POST .../submit-rating -d '{...}'
# Expected: <100ms (no blockchain wait)
```

---

### ✅ FIX 5: Guardian Escalation
**What changed:**
- 3-tier ladder: notify → prompt → allow_live
- 5-minute escalation window
- Prevents session spam

**Test:**
```python
from monitor.alert_manager import get_alert_action

get_alert_action(1)  # {"action": "notify"}
get_alert_action(1)  # {"action": "prompt"}
get_alert_action(1)  # {"action": "allow_live"}
```

---

## Demo Flow

### Scenario 1: Concurrent Bookings
1. Two users select same caregiver at overlapping time
2. First confirms → Success (200)
3. Second confirms → "Time slot unavailable" (409)
4. **Demo point:** Database prevents double-booking

### Scenario 2: AI Service Down
1. Stop AI service
2. Civilian requests care
3. Match endpoint returns in 800ms
4. Shows caregivers ranked by trust score
5. **Demo point:** System stays responsive

### Scenario 3: Trust Score Update
1. Caregiver has trust score 60
2. Civilian submits 5-star rating
3. Refresh caregiver profile
4. Trust score now 75
5. **Demo point:** Real-time consistency

### Scenario 4: Rating Submission
1. Civilian submits rating
2. API responds immediately "pending"
3. Database shows `blockchain_status = "pending"`
4. **Demo point:** Non-blocking UX

### Scenario 5: Safety Monitoring
1. Anomaly detected → Notification sent (alert 1)
2. Another anomaly → Guardian prompted (alert 2)
3. Third anomaly → Auto-enable live mode (alert 3)
4. **Demo point:** Escalation prevents spam

---

## Files Changed

| Fix | Files | Lines |
|-----|-------|-------|
| Race Condition | `booking.py`, `civilian.py` | 40 |
| AI Timeout | `civilian.py` | 15 |
| Trust Score | `caregiver.py` | 30 |
| Blockchain | `rating.py`, `civilian.py` | 25 |
| Escalation | `alert_manager.py`, `main.py` | 150 |

**Total:** 7 files, ~260 lines

---

## Run Tests
```bash
cd tests/integration
pytest test_demo_fixes.py -v
```

---

## Production Notes

- **FIX 1:** Run database migration for index
- **FIX 2:** Monitor AI service uptime
- **FIX 4:** Deploy Celery worker for blockchain
- **FIX 5:** Configure alert retention policy
