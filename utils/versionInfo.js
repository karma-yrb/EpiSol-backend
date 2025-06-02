/**
 * Version Info Utility for EpiSol Backend
 * Provides version information from package.json
 */

const fs = require('fs');
const path = require('path');

class VersionInfo {
  constructor() {
    try {
      const packagePath = path.join(__dirname, '../package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      this.version = packageData.version;
      this.name = packageData.name;
      this.startTime = new Date().toISOString();
    } catch (error) {
      console.error('Error loading version info:', error);
      this.version = 'unknown';
      this.name = 'episol-backend';
      this.startTime = new Date().toISOString();
    }
  }

  getVersionInfo() {
    return {
      name: this.name,
      version: this.version,
      startTime: this.startTime,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  getVersionString() {
    return `${this.name} v${this.version}`;
  }

  logStartup() {
    console.log(`🚀 ${this.getVersionString()} started successfully`);
    console.log(`📅 Start time: ${this.startTime}`);
    console.log(`🖥️  Platform: ${process.platform}`);
    console.log(`📦 Node.js: ${process.version}`);
  }
}

module.exports = new VersionInfo();
