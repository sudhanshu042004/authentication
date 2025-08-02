# Use Bun's official image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Expose the port Bun will run on
EXPOSE 3000

# Command to run your app
CMD ["bun", "run", "start"]
