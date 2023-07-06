 
# Start from the official Node.js Docker image
FROM node:14

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install vtracer
RUN cargo install vtracer

# Copy your application files to the Docker image
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Start your application
CMD [ "npm", "start" ]
