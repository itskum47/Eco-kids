const { Client, Databases, Storage, Functions, Messaging } = require('node-appwrite');
const config = require('./appwrite-config');

class AppwriteClient {
  constructor() {
    try {
      this.client = new Client();

      if (config.endpoint) {
        this.client.setEndpoint(config.endpoint);
      }

      if (config.projectId) {
        this.client.setProject(config.projectId);
      }

      if (config.apiKey) {
        this.client.setKey(config.apiKey);
      }

      // Initialize SDK modules safely
      this.databases = new Databases(this.client);
      this.storage = new Storage(this.client);
      this.functions = new Functions(this.client);
      this.messaging = new Messaging(this.client);
    } catch (error) {
      console.warn('[AppwriteClient] Initialization warning:', error.message);
    }
  }

  health() {
    return {
      success: Boolean(config.endpoint && config.projectId && config.apiKey),
      endpoint: config.endpoint || null,
      projectId: config.projectId || null
    };
  }

  getClient() {
    return this.client;
  }

  getDatabase() {
    return this.databases;
  }

  getStorage() {
    return this.storage;
  }

  getFunctions() {
    return this.functions;
  }

  getMessaging() {
    return this.messaging;
  }

  getConfig() {
    return config;
  }
}

module.exports = new AppwriteClient();
