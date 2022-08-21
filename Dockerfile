FROM node:16-alpine
RUN apk add g++ make python3

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json .
COPY package-lock.json .
COPY lerna.json .

COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/eslint-config/package-lock.json ./packages/eslint-config/

COPY packages/eslint-rules/package.json ./packages/eslint-rules/
COPY packages/eslint-rules/package-lock.json ./packages/eslint-rules/

COPY packages/extension/package.json ./packages/extension/
COPY packages/extension/package-lock.json ./packages/extension/

COPY packages/prettier-config/package.json ./packages/prettier-config/
COPY packages/prettier-config/package-lock.json ./packages/prettier-config/

COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/package-lock.json ./packages/shared/

COPY packages/webapp/package.json ./packages/webapp/
COPY packages/webapp/package-lock.json ./packages/webapp/

RUN \
  apk --no-cache add \
  libc6-compat

RUN npm i -g lerna
RUN lerna bootstrap

COPY packages ./packages

WORKDIR /opt/app/packages/webapp
CMD ["npm", "run", "dev"]

