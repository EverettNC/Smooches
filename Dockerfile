# SMOOCHES production image.
# Base images come from Amazon's public mirror of the official Node images,
# so builds are not held up by Docker Hub's pull limits.
FROM public.ecr.aws/docker/library/node:18-alpine AS builder
WORKDIR /app
# canvas and bcrypt compile natively on Alpine
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Schema sync: run once per deploy as a one-off task (drizzle-kit push)
FROM builder AS migrate
CMD ["npx", "drizzle-kit", "push", "--force"]

FROM public.ecr.aws/docker/library/node:18-alpine AS production
WORKDIR /app
RUN apk add --no-cache cairo pango jpeg giflib pixman
COPY package*.json ./
# The full dependency set: the built server still imports vite and the
# vite config's plugins at start-up, so pruning dev packages breaks it.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
ENV NODE_ENV=production
ENV PORT=8030
EXPOSE 8030
RUN addgroup -g 1001 -S nodejs && adduser -S smooches -u 1001 \
 && mkdir -p /app/public/uploads/videos /app/public/uploads/avatars \
 && chown -R smooches:nodejs /app/public
USER smooches
CMD ["node", "dist/index.js"]
