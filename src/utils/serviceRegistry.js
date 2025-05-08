const logger = require('../config/logger');

// In-memory store for services
const services = new Map(); // { serviceName: [{ url, lastHeartbeat, status }] }

const registerService = (serviceName, url) => {
  if (!services.has(serviceName)) {
    services.set(serviceName, []);
  }
  const serviceInstances = services.get(serviceName);
  const existingInstance = serviceInstances.find((instance) => instance.url === url);

  if (!existingInstance) {
    serviceInstances.push({
      url,
      lastHeartbeat: Date.now(),
      status: 'healthy',
    });
    logger.info(`Registered ${serviceName} at ${url}`);
  } else {
    existingInstance.lastHeartbeat = Date.now();
    existingInstance.status = 'healthy';
    logger.info(`Updated heartbeat for ${serviceName} at ${url}`);
  }
};

const getServiceUrl = (serviceName) => {
  const serviceInstances = services.get(serviceName) || [];
  const healthyInstances = serviceInstances.filter(
    (instance) => instance.status === 'healthy' && Date.now() - instance.lastHeartbeat < 30000 // 30s timeout
  );

  if (healthyInstances.length === 0) {
    logger.error(`No healthy instances for ${serviceName}`);
    return null;
  }

  // Simple round-robin load balancing
  const instance = healthyInstances[Math.floor(Math.random() * healthyInstances.length)];
  return instance.url;
};

const performHealthCheck = async () => {
  for (const [serviceName, instances] of services.entries()) {
    for (const instance of instances) {
      try {
        const response = await fetch(`${instance.url}/health`, {
          method: 'GET',
          timeout: 5000,
        });
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        instance.lastHeartbeat = Date.now();
        instance.status = 'healthy';
      } catch (error) {
        logger.warn(`Health check failed for ${serviceName} at ${instance.url}: ${error.message}`);
        instance.status = 'unhealthy';
      }
    }
  }
};

// Run health checks every 10 seconds
setInterval(performHealthCheck, 10000);

module.exports = {
  registerService,
  getServiceUrl,
  performHealthCheck,
};