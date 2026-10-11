FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 8545
CMD ["pnpm", "exec", "hardhat", "node", "--hostname", "0.0.0.0"]
