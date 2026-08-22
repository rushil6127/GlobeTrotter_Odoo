import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 GlobeTrotter Backend Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`📡 Health Check: http://localhost:${config.port}/health`);
  console.log(`🔑 Auth Endpoints: http://localhost:${config.port}/api/auth`);
});
