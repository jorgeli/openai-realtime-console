# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create dist directory if it doesn't exist
RUN mkdir -p dist

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Copy .env file if it exists
COPY .env* ./

# Define the command to run the app
CMD ["sh", "-c", "echo OPENAI_API_KEY=$OPENAI_API_KEY && npm run dev"]