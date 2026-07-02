FROM node:22-alpine

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY src/ ./src/

ARG VERSION=dev
ENV VERSION=$VERSION

EXPOSE 3000

CMD ["node", "src/index.js"]
