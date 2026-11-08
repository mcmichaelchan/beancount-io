ARG NODE_IMAGE=node:22.23.4-alpine
FROM ${NODE_IMAGE}

WORKDIR /app

RUN corepack enable

# Manifests first for layer caching (Yarn 4 needs .yarnrc.yml before install,
# otherwise it defaults to PnP and produces no node_modules)
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY . .

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000

CMD ["yarn", "start"]
