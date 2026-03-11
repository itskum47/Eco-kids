FROM node:18-alpine AS deps

WORKDIR /app

# Native build tools for sharp (bcrypt, etc.)
RUN apk add --no-cache python3 make g++ vips-dev

COPY package.json package-lock.json ./

# Skip Chromium download — puppeteer uses it for PDF generation only,
# and in production we can use puppeteer-core + a lighter approach.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN npm ci --only=production --ignore-scripts=false && \
    npm cache clean --force

# -----------------------------------------------------------
FROM node:18-alpine AS production

# Runtime deps for sharp (no build tools — smaller image)
RUN apk add --no-cache vips && \
    addgroup -g 1001 -S ecokids && \
    adduser -S ecokids -u 1001 -G ecokids

WORKDIR /app

COPY --from=deps --chown=ecokids:ecokids /app/node_modules ./node_modules
COPY --chown=ecokids:ecokids package.json package-lock.json ./
COPY --chown=ecokids:ecokids config/ ./config/
COPY --chown=ecokids:ecokids controllers/ ./controllers/
COPY --chown=ecokids:ecokids middleware/ ./middleware/
COPY --chown=ecokids:ecokids models/ ./models/
COPY --chown=ecokids:ecokids queues/ ./queues/
COPY --chown=ecokids:ecokids routes/ ./routes/
COPY --chown=ecokids:ecokids scripts/ ./scripts/
COPY --chown=ecokids:ecokids services/ ./services/
COPY --chown=ecokids:ecokids utils/ ./utils/
COPY --chown=ecokids:ecokids workers/ ./workers/
COPY --chown=ecokids:ecokids server.js ./

ENV NODE_ENV=production
ENV PORT=5001

USER ecokids

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=5 \
    CMD curl -f http://localhost:5001/health || exit 1

CMD ["node", "server.js"]
