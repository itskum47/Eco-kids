# EcoKids India - Production Runbook

## 1. MongoDB Backup Strategy (CRITICAL)

If MongoDB Atlas misconfiguration, human error, or database corruption occurs, the system will face permanent data loss without these controls.

**REQUIRED CONFIGURATION (MongoDB Atlas):**

1. **Point-in-Time Recovery (PITR):**
   - ENABLE PITR for immediate rollback capabilities (protects against accidental drops/updates).
   - Recommended retention: 7 days.
2. **Automated Daily Snapshots:**
   - Configure a daily snapshot schedule.
   - Recommended retention: 30 days.
3. **Multi-Region Node:**
   - Deploy at least one read-only replica in a secondary region to protect against region-wide AWS/GCP outages.

## 2. Redis Persistence Strategy

By default, Redis operates purely in-memory. If a pod recycles or crashes, leaderboards, locks, notifications, and the BullMQ job queue vanish.

**REQUIRED CONFIGURATION (Redis Cluster/Helm):**

Ensure your Redis deployment uses a Persistent Volume Claim (PVC) and the following configuration is applied to `redis.conf` (or via command flags):

```text
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000
```
This guarantees AOF (Append Only File) persistence, writing every second, with snapshots occurring periodically depending on write velocity.

*(Note: These flags have been applied natively to the local `docker-compose.yml` `redis` block).*

## 3. Worker Node Graceful Shutdowns

The `ecokids-worker` uses `BullMQ`. If the underlying container runtime (Docker, K8s) sends a `SIGTERM`, the worker must *not* immediately die.
Kubernetes `terminationGracePeriodSeconds` for the worker is set to `60` seconds in the Helm chart. This allows active background jobs (e.g., Cloudinary cleanup or gamification awarding) to cleanly finish before the container is permanently deleted.

## 4. Autoscaling Resiliency

The platform utilizes a **PodDisruptionBudget (PDB)** to prevent downscaling to 0 during rolling updates or node drains.
- API minimum required pods: `2`
- Worker minimum required pods: `1`

This ensures that the EcoKids app maintains strictly high availability and a stable throughput capacity at all times.

## 5. Global Delivery & Edge Protection (Cloudflare)

To protect the Kubernetes origin and ensure the absolute fastest response times globally, deploy Cloudflare in front of the application.

**CDN Caching Rules:**
- `/_next/static/*` -> **Cache Everything** (Browser TTL: 1 year, Edge Cache TTL: 1 year)
- `/images/*` -> **Cache Everything** (Browser TTL: 1 month)
- `/api/*` -> **Bypass Cache** (Dynamic content)

**Rate Limiting:**
Rate limit edge endpoints before they touch the Node.js API to completely neutralize brute force attempts.
- `/api/auth/login` -> Limit: **5 requests / minute per IP**
- `/api/activity/submit` -> Limit: **10 requests / minute per IP**

*Note:* Cloudflare forces Brotli compression natively at the edge, scaling bandwidth efficiency further. Wait, but Node.js `compression` middleware is also globally activated to catch any bypassed endpoints.

## 6. Official Deployment Handoff Checklist

Prior to migrating traffic to the production ingress, the DevOps/Platform team must legally verify the following:

- [ ] MongoDB backups verified
- [ ] Redis persistence verified
- [ ] Prometheus metrics verified
- [ ] Sentry receiving errors
- [ ] Autoscaling verified
- [ ] Rate limiting verified
- [ ] CDN active
- [ ] Health checks verified
- [ ] Chaos test completed
- [ ] **Final Validation 1:** Verify Observability End-to-End (Inject real error and confirm Sentry/Logs receive it)
- [ ] **Final Validation 2:** Verify Autoscaling Triggers (Run k6 and confirm `kubectl get hpa -w` shows scaling)
- [ ] **Final Validation 3:** Verify Backup Restoration (Simulate Mongo snapshot restore in staging and verify reads)
