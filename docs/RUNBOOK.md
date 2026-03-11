# EcoKids India — Operations Runbook

## Quick Reference

| Item | Value |
|------|-------|
| **Production URL** | `https://ecokids.example.com` |
| **API Health** | `GET /health` → 200 = healthy |
| **Metrics** | `GET /metrics` (internal only, blocked by nginx) |
| **Grafana** | `http://monitoring.internal:3001` (admin/ecokids2024) |
| **Docker Compose (prod)** | `docker compose -f docker-compose.prod.yml up -d` |
| **Monitoring** | `docker compose -f docker-compose.monitoring.yml up -d` |
| **Backup** | `bash scripts/backup.sh` |
| **Restore** | `bash scripts/restore.sh <file-or-s3-path>` |
| **RTO** | 2 hours |
| **RPO** | 24 hours (nightly backup) |

---

## 1. Deployment

### Start Production
```bash
# Ensure .env.production exists in server/
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.monitoring.yml up -d
```

### Check Status
```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost:5001/health | jq
docker stats --no-stream
```

### Rolling Update
```bash
docker compose -f docker-compose.prod.yml build api worker
docker compose -f docker-compose.prod.yml up -d --no-deps api worker
```

### Rollback
```bash
# Revert to previous image
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 2. Incident Response

### API Down (Alert: APIDown)
1. Check: `docker compose -f docker-compose.prod.yml ps`
2. Check logs: `docker logs ecokids-api --tail 100`
3. If OOM: Increase memory limit in `docker-compose.prod.yml`
4. If crash loop: `docker compose -f docker-compose.prod.yml restart api`
5. If DB connection error: Check Atlas status page

### High Latency (Alert: HighLatency)
1. Check Grafana HTTP latency dashboard
2. Check: `docker stats ecokids-api` for CPU/memory
3. Check slow queries: Atlas Performance Advisor
4. Restart if needed: `docker compose -f docker-compose.prod.yml restart api`

### High Error Rate (Alert: HighErrorRate)
1. Check logs: `docker logs ecokids-api --tail 200 2>&1 | grep "error"`
2. Check Sentry for stack traces
3. If new deployment: rollback immediately
4. If external service: check Cloudinary/Redis status

### Queue Backlog (Alert: QueueBacklog)
1. Check: `docker logs ecokids-worker --tail 100`
2. Bull Board: `https://ecokids.example.com/admin/queues`
3. If worker crashed: `docker compose -f docker-compose.prod.yml restart worker`
4. If stuck job: clear from Bull Board UI

---

## 3. Backup & Restore

### Manual Backup
```bash
export MONGO_URI="mongodb+srv://..."
export BACKUP_S3_BUCKET="ecokids-backups"
bash scripts/backup.sh
```

### Restore from Backup
```bash
# From S3
export MONGO_URI="mongodb+srv://..."
bash scripts/restore.sh s3://ecokids-backups/daily/ecokids-20240301_120000.gz

# From local file
bash scripts/restore.sh /tmp/ecokids-20240301_120000.gz
```

### Verify Backup
```bash
# List available backups
aws s3 ls s3://ecokids-backups/daily/ --human-readable
```

---

## 4. Scaling

### Vertical (single machine)
```yaml
# docker-compose.prod.yml → api service
deploy:
  resources:
    limits:
      memory: 1g    # was 512m
      cpus: "2.0"   # was 1.0
```

### Horizontal (multiple instances)
```yaml
# docker-compose.prod.yml → api service
deploy:
  replicas: 3
```
Requires: Redis-based sessions (already done), Redis rate limiting (Phase B).

---

## 5. Redis

### Check Redis
```bash
docker exec ecokids-redis redis-cli info memory
docker exec ecokids-redis redis-cli info clients
docker exec ecokids-redis redis-cli dbsize
```

### Flush Redis (emergency only)
```bash
docker exec ecokids-redis redis-cli FLUSHALL
```

---

## 6. Secrets Rotation

| Secret | Rotation | How |
|--------|----------|-----|
| JWT_SECRET | 90 days | Update .env.production, redeploy, all sessions invalidated |
| MONGO_URI | On compromise | Rotate via Atlas UI, update .env.production |
| CLOUDINARY_API_SECRET | On compromise | Rotate via Cloudinary dashboard |
| GRAFANA_ADMIN_PASSWORD | 90 days | Update docker-compose.monitoring.yml |

---

## 7. Monitoring Checklist (Daily)

- [ ] All docker services running (`docker compose ps`)
- [ ] Health endpoint returns 200
- [ ] No critical alerts in Slack
- [ ] Grafana dashboards loading
- [ ] Nightly backup succeeded (check S3)
- [ ] Sentry: no new unhandled errors
