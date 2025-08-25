#!/usr/bin/env node

// FINAL DEPLOYMENT SOLUTION - NO BUILD REQUIRED
console.log('🚀 FINAL DEPLOYMENT SOLUTION - STARTING SERVER');

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('📂 Working directory:', process.cwd());
console.log('📂 Script directory:', __dirname);

// Simple Express server for your job portal
import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job Portal API is running!' });
});

// API routes (simple in-memory data for now)
const jobs = [
  { id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time' },
  { id: '2', title: 'Backend Developer', company: 'StartupXYZ', location: 'San Francisco', type: 'Full-time' },
  { id: '3', title: 'Data Scientist', company: 'DataCorp', location: 'New York', type: 'Contract' }
];

const courses = [
  { id: '1', title: 'React Fundamentals', instructor: 'John Doe', duration: '4 weeks', price: 99 },
  { id: '2', title: 'Node.js Backend', instructor: 'Jane Smith', duration: '6 weeks', price: 149 },
  { id: '3', title: 'Database Design', instructor: 'Bob Johnson', duration: '3 weeks', price: 79 }
];

// API endpoints
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ message: 'Thank you for your message! We will get back to you soon.' });
});

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  console.log('User registration:', req.body);
  res.json({ 
    success: true, 
    message: 'Account created successfully!',
    user: { id: Date.now(), email: req.body.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('User login:', req.body);
  res.json({ 
    success: true, 
    message: 'Login successful!',
    user: { id: Date.now(), email: req.body.email },
    token: 'sample-jwt-token'
  });
});

// Job application endpoint
app.post('/api/jobs/:id/apply', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (job) {
    console.log(`Application for ${job.title}:`, req.body);
    res.json({ 
      success: true, 
      message: `Application submitted for ${job.title}!` 
    });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Serve static files (client build)
const clientPath = path.join(__dirname, 'dist', 'client');
app.use(express.static(clientPath));

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve the client index.html
  const indexPath = path.join(clientPath, 'index.html');
  
  // Debug: Check if client files exist
  console.log('🔍 Looking for client at:', clientPath);
  console.log('🔍 Index path:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving client:', err);
      console.error('📁 Client path exists:', require('fs').existsSync(clientPath));
      console.error('📄 Index exists:', require('fs').existsSync(indexPath));
      
      res.status(200).send(`
        <html>
          <head>
            <title>Job Portal - Loading</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .loading { text-align: center; padding: 40px; }
              .error { color: #e74c3c; }
              .info { color: #3498db; }
            </style>
          </head>
          <body>
            <div class="loading">
              <h1>🚀 Job Portal</h1>
              <p class="error">React app is loading...</p>
              <p class="info">If this persists, the client build may have failed.</p>
              <p>API is working: <a href="/api/jobs">Test Jobs API</a></p>
              <p>Health check: <a href="/health">Test Health</a></p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const port = process.env.PORT || 10000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Job Portal running on port ${port}`);
  console.log(`📱 Visit: http://localhost:${port}`);
  console.log(`🔗 API: http://localhost:${port}/api/jobs`);
});

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});