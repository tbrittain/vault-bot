FROM node:14-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run build

FROM gcr.io/distroless/nodejs:14
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY --from=builder /usr/src/app/build ./
CMD ["node", "server.js"]
