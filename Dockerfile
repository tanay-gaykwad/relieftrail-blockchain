FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 8545
CMD ["pnpm", "exec", "hardhat", "node", "--hostname", "0.0.0.0"]
