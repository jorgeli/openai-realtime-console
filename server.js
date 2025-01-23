import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env file explicitly
dotenv.config();

console.log('Environment check on startup:');
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

const schema = {
  type: "object",
  required: ["OPENAI_API_KEY"],
  properties: {
    OPENAI_API_KEY: {
      type: "string",
    },
  },
};

await server.register(fastifyEnv, { dotenv: true, schema });

// Serve static files from the dist directory
await server.register(fastifyStatic, {
  root: join(__dirname, 'dist'),
  prefix: '/',
});

// Add at the top of server.js
server.addHook('onRequest', (request, reply, done) => {
  console.log(`${request.method} ${request.url}`);
  done();
});

server.addHook('onResponse', (request, reply, done) => {
  console.log(`Response ${reply.statusCode}`);
  done();
});

// Server-side API route to return an ephemeral realtime session token
server.get("/token", async (request, reply) => {
  try {
    console.log('Attempting to fetch token from OpenAI...');
    
    const requestBody = JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
    });

    console.log('Request body:', requestBody);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    console.log('OpenAI Response Status:', r.status);
    
    const responseText = await r.text();
    console.log('Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid JSON response from OpenAI');
    }

    console.log('Parsed Response:', JSON.stringify(data, null, 2));
    
    if (!data || !data.client_secret) {
      console.error('Invalid response structure:', data);
      throw new Error(`Invalid response structure: ${JSON.stringify(data)}`);
    }

    return reply.send(data);
  } catch (error) {
    console.error('Token generation error:', error);
    return reply.status(500).send({ 
      error: 'Failed to generate token',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 8080;

await server.listen({ 
  port: PORT,
  host: '0.0.0.0'
});
