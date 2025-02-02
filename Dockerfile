FROM node:22.13.1-alpine3.21 AS BUILD

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22.13.1-alpine3.21

WORKDIR /app

COPY --from=BUILD /app/package.json /app/package-lock.json /app/tsconfig.build.json /app/tsconfig.json ./
COPY --from=BUILD /app/node_modules ./node_modules
COPY --from=BUILD /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]