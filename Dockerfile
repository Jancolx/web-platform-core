FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY src/package*.json ./
RUN npm install --production

# Copy the rest of the source code
COPY src/ .

# Match the port expected by your Terraform/ALB
ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
