FROM ubuntu:xenial

# Install dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    dosbox \
    pulseaudio \
    ffmpeg \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

# Create app directory
WORKDIR /app

# Install Node.js dependencies
COPY package.json .
RUN npm install

# Copy the JavaScript files and startup script
COPY generate.js .
COPY server.js .
COPY sbaitso.png .
COPY start.sh .

# Make the startup script executable
RUN chmod +x start.sh

# Copy the sbaitso folder
COPY sbaitso/ sbaitso/

# Copy the public folder
COPY public/ public/

# Expose the server port
EXPOSE 3000

# Run the startup script
ENTRYPOINT ["/app/start.sh"]
