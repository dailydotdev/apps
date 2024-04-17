FROM node:20.12-alpine
RUN apk add g++ make python3

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json .

COPY packages/eslint-config/package*.json ./packages/eslint-config/

COPY packages/eslint-rules/package*.json ./packages/eslint-rules/

COPY packages/extension/package*.json ./packages/extension/

COPY packages/prettier-config/package*.json ./packages/prettier-config/

COPY packages/shared/package*.json ./packages/shared/

COPY packages/webapp/package*.json ./packages/webapp/

RUN \
  apk --no-cache add \
  libc6-compat

RUN npm i -g pnpm
RUN pnpm install

COPY packages ./packages

WORKDIR /opt/app/packages/webapp
CMD ["npm", "run", "dev"]

