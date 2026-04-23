# Use official Node.js LTS image
FROM node:20-alpine AS base
ENV NODE_ENV=production

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (if needed)
# RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and start next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./

# Set hostname for standalone server
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]