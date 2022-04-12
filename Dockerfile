FROM node:17 as BUILD

RUN npm install typescript -g

WORKDIR /redditfix
COPY ./src src
COPY package-lock.json package-lock.json
COPY package.json package.json
COPY tsconfig.json tsconfig.json

RUN npm ci --include=dev
RUN tsc

FROM node:17-alpine

WORKDIR /redditfix/
COPY --from=BUILD /redditfix/dist ./dist
COPY --from=BUILD /redditfix/package.json ./package.json
COPY --from=BUILD /redditfix/package-lock.json ./package-lock.json
COPY ./public /redditfix/public
RUN npm ci

ENTRYPOINT [ "npm", "start" ]