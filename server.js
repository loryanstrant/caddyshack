const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;
const CADDYFILE_PATH = process.env.CADDYFILE_PATH || '/caddy/Caddyfile';
const CADDY_ADMIN_ENDPOINT = process.env.CADDY_ADMIN_ENDPOINT || 'http://host.docker.internal:2019';
const TIMEZONE = process.env.TZ || 'UTC';
const BACKUPS_DIR = path.join(path.dirname(CADDYFILE_PATH), 'backups');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure backups directory exists
fs.ensureDirSync(BACKUPS_DIR);

// Helper function to create timestamp
const getTimestamp = () => {
  return moment().tz(TIMEZONE).format('YYYY-MM-DD_HH-MM-SS');
};

// Helper function to get version number for same day backups
const getVersionNumber = (baseTimestamp) => {
  const baseDate = baseTimestamp.split('_')[0];
  const existingBackups = fs.readdirSync(BACKUPS_DIR)
    .filter(file => file.startsWith(`Caddyfile.backup.${baseDate}`))
    .length;
  return existingBackups + 1;
};

// Helper function to create backup
const createBackup = async () => {
  try {
    const timestamp = getTimestamp();
    const baseDate = timestamp.split('_')[0];
    const version = getVersionNumber(timestamp);
    const backupName = `Caddyfile.backup.${baseDate}_v${version}`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    
    await fs.copy(CADDYFILE_PATH, backupPath);
    console.log(`🏌️ Backup created: ${backupName} - "It's in the hole!"`);
    return backupName;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
};

// Helper function to reload Caddy configuration
const reloadCaddyConfig = async () => {
  try {
    const response = await axios.post(`${CADDY_ADMIN_ENDPOINT}/load`, 
      fs.readFileSync(CADDYFILE_PATH, 'utf8'),
      {
        headers: {
          'Content-Type': 'text/caddyfile'
        },
        timeout: 10000
      }
    );
    return { success: true, message: "Configuration reloaded successfully! 'So I got that goin' for me, which is nice.'" };
  } catch (error) {
    console.error('❌ Failed to reload Caddy config:', error);
    return { 
      success: false, 
      message: `Failed to reload configuration: ${error.message}. "I don't think the heavy stuff's gonna come down for quite awhile."` 
    };
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), timezone: TIMEZONE });
});

// Get current Caddyfile content
app.get('/api/caddyfile', async (req, res) => {
  try {
    const content = await fs.readFile(CADDYFILE_PATH, 'utf8');
    res.json({ 
      content, 
      lastModified: (await fs.stat(CADDYFILE_PATH)).mtime,
      timezone: TIMEZONE
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to read Caddyfile', 
      message: "Spaulding, get your foot off the boat! We can't read the file!" 
    });
  }
});

// Save Caddyfile content
app.post('/api/caddyfile', [
  body('content').notEmpty().withMessage('Caddyfile content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        message: "That's a peach, hon. But we need some content!" 
      });
    }

    const { content } = req.body;
    
    // Create backup before saving
    const backupName = await createBackup();
    
    // Save new content
    await fs.writeFile(CADDYFILE_PATH, content, 'utf8');
    
    res.json({ 
      success: true, 
      backupCreated: backupName,
      message: "Caddyfile saved successfully! 'Hey everybody, we're all gonna get laid!'"
    });
  } catch (error) {
    console.error('❌ Failed to save Caddyfile:', error);
    res.status(500).json({ 
      error: 'Failed to save Caddyfile',
      message: "So we finish the eighteenth and he's gonna stiff me. And I say, 'Hey, Lama, hey, how about a little something, you know, for the effort?'"
    });
  }
});

// Reload Caddy configuration
app.post('/api/reload', async (req, res) => {
  const result = await reloadCaddyConfig();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// Get list of backups
app.get('/api/backups', async (req, res) => {
  try {
    const backups = await fs.readdir(BACKUPS_DIR);
    const backupDetails = await Promise.all(
      backups.filter(file => file.startsWith('Caddyfile.backup.'))
        .map(async (file) => {
          const stats = await fs.stat(path.join(BACKUPS_DIR, file));
          return {
            name: file,
            created: stats.mtime,
            size: stats.size
          };
        })
    );
    
    // Sort by creation time (newest first)
    backupDetails.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json(backupDetails);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list backups',
      message: "I'm gonna get that gopher! We got backups somewhere around here..."
    });
  }
});

// Restore from backup
app.post('/api/restore/:backupName', async (req, res) => {
  try {
    const { backupName } = req.params;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    
    // Check if backup exists
    if (!await fs.pathExists(backupPath)) {
      return res.status(404).json({ 
        error: 'Backup not found',
        message: "I'm not a loser! I'm a backup restoration specialist!"
      });
    }
    
    // Create backup of current file before restoring
    const currentBackupName = await createBackup();
    
    // Restore from backup
    await fs.copy(backupPath, CADDYFILE_PATH);
    
    res.json({ 
      success: true,
      currentBackupCreated: currentBackupName,
      message: `Restored from ${backupName}. "Gunga galunga... gunga, gunga-lagunga."`
    });
  } catch (error) {
    console.error('❌ Failed to restore backup:', error);
    res.status(500).json({ 
      error: 'Failed to restore backup',
      message: "So I jump ship in Hong Kong and I make my way over to Tibet, and I get on as a looper at a course over in the Himalayas."
    });
  }
});

// Get Caddy admin API status
app.get('/api/caddy/status', async (req, res) => {
  try {
    const response = await axios.get(`${CADDY_ADMIN_ENDPOINT}/config/`, {
      timeout: 5000
    });
    res.json({ 
      status: 'connected', 
      version: response.headers['server'] || 'Unknown',
      message: "Caddy is alive and kicking! 'Be the ball, Danny.'"
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected',
      error: error.message,
      message: "Can't reach Caddy admin API. 'So I got that goin' for me, which is nice.'"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🏌️ Caddyshack UI is running on port ${PORT}`);
  console.log(`🌍 Timezone: ${TIMEZONE}`);
  console.log(`📁 Caddyfile path: ${CADDYFILE_PATH}`);
  console.log(`🔧 Caddy admin endpoint: ${CADDY_ADMIN_ENDPOINT}`);
  console.log(`💾 Backups directory: ${BACKUPS_DIR}`);
  console.log(`🎬 "So I got that goin' for me, which is nice."`);
});

module.exports = app;
