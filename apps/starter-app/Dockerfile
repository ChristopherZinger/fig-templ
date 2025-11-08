FROM --platform=linux/amd64 node:22-slim AS pruner
WORKDIR /app

RUN npm install -g turbo
COPY . .
RUN turbo prune templetto-starter-app --docker

FROM --platform=linux/amd64 node:22-slim AS runner
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN npm install

COPY --from=pruner /app/out/full/ .

WORKDIR /app/apps/starter-app
RUN NODE_ENV=production npm run build

EXPOSE 3000
CMD ["node", "build"]
