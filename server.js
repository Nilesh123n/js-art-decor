/**
 * Root Entry Point for Node.js Hosting Deployments (Hostinger, cPanel, Passenger, PM2)
 *
 * Hostinger's Node.js selector typically expects `server.js` or `app.js` at the project root.
 * This file boots and exports the compiled CommonJS Express application from `dist/server.cjs`.
 */

let app;

try {
  const serverModule = require("./dist/server.cjs");
  app = serverModule.default || serverModule.app || serverModule;
} catch (err) {
  console.error("Failed to load ./dist/server.cjs. Please make sure 'npm run build' has been executed.", err);
  throw err;
}

module.exports = app;
