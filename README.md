# Caddyshack 🏌️

> *"It's a Cinderella story... managing Caddy configurations!"*

A beautiful web UI for managing Caddy reverse proxy configurations with a fun "Caddyshack" theme inspired by the 1980 movie. This Docker-based solution provides an intuitive interface to add, modify, and remove Caddy entries while keeping your configurations safely backed up.

## Features 🎯

- **🎨 Beautiful Web UI** - Golf course-themed interface with quotes from the movie
- **📝 Caddyfile Editor** - Syntax-highlighted editor for easy configuration editing
- **💾 Automatic Backups** - Creates timestamped backups before any changes (with version numbering for same-day edits)
- **🔄 Live Reload** - Prompts to reload Caddy configuration after saving changes
- **🕐 Timezone Support** - Configurable timezone for backup timestamps
- **📊 Status Monitoring** - Real-time connection status to Caddy admin API
- **📚 Backup Management** - View and restore from previous configurations
- **🎬 Movie References** - Easter eggs and quotes throughout the interface

## Quick Start 🚀

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd caddyshack
   ```

2. **Copy the environment file:**
   ```bash
   copy .env.example .env
   ```

3. **Edit the environment variables:**
   ```env
   CADDYSHACK_PORT=8080
   TIMEZONE=America/New_York
   CADDYFILE_LOCATION=./Caddyfile
   CADDY_ADMIN_ENDPOINT=http://host.docker.internal:2019
   ```

4. **Start the application:**
   ```bash
   docker-compose up -d
   ```

5. **Access the UI:**
   Open your browser to `http://localhost:8080` (or your configured port)

## Configuration 🛠️

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CADDYSHACK_PORT` | Port for the web UI | `8080` |
| `TIMEZONE` | Timezone for backups and timestamps | `UTC` |
| `CADDYFILE_LOCATION` | Path to your existing Caddyfile | `./Caddyfile` |
| `CADDY_ADMIN_ENDPOINT` | Caddy admin API endpoint | `http://host.docker.internal:2019` |

### Docker Compose

The `docker-compose.yml` file includes:
- **caddyshack-ui**: The web interface container
- **Volume mounts**: For Caddyfile access and backup storage
- **Network**: Bridge network for container communication

## How It Works 🔧

### Backup System
- **Automatic backups** are created before any Caddyfile modifications
- **Timestamp format**: `Caddyfile.backup.YYYY-MM-DD_HH-MM-SS`
- **Version numbering**: Multiple edits on the same day get version numbers (v1, v2, etc.)
- **Example**: `Caddyfile.backup.2025-01-15_14-30-45_v2`

### Caddy Integration
- Connects to Caddy's admin API for configuration reloading
- Monitors connection status in real-time
- Prompts for reload after saving changes
- Manual reload option available

### Web Interface
- **Editor**: Syntax-highlighted Caddyfile editor
- **Backups**: List of all backups with restore functionality
- **Status Bar**: Shows Caddy connection, timezone, and last modified time
- **Responsive**: Works on desktop and mobile devices

## API Endpoints 📡

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/caddyfile` | GET | Get current Caddyfile content |
| `/api/caddyfile` | POST | Save Caddyfile content |
| `/api/reload` | POST | Reload Caddy configuration |
| `/api/backups` | GET | List all backups |
| `/api/restore/:backup` | POST | Restore from backup |
| `/api/caddy/status` | GET | Check Caddy admin API status |

## Prerequisites 📋

- Docker and Docker Compose
- An existing Caddy server with admin API enabled (default port 2019)
- Access to the Caddyfile you want to manage

## Caddy Admin API Setup

Make sure your Caddy server has the admin API enabled. In your main Caddy configuration:

```caddyfile
{
    admin localhost:2019
}
```

Or if running Caddy in Docker, ensure the admin port is accessible from the Caddyshack container.

## Development 🔨

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Building

```bash
# Build Docker image
docker build -t caddyshack-ui .

# Or use docker-compose
docker-compose build
```

## Movie References 🎬

The interface includes various quotes and references from the 1980 movie "Caddyshack":

- *"So I got that goin' for me, which is nice."* - Carl Spackler
- *"Be the ball, Danny."* - Ty Webb
- *"It's in the hole!"* - Carl Spackler
- *"Hey everybody, we're all gonna get laid!"* - Al Czervik
- And many more throughout the interface!

## Troubleshooting 🔍

### Common Issues

1. **Can't connect to Caddy admin API**
   - Check that Caddy admin API is enabled and accessible
   - Verify the `CADDY_ADMIN_ENDPOINT` environment variable
   - Ensure firewall allows connections on port 2019

2. **Backup creation fails**
   - Check file permissions on the Caddyfile location
   - Ensure the backup volume has write permissions

3. **Configuration reload fails**
   - Verify Caddyfile syntax is valid
   - Check Caddy logs for error details
   - Ensure Caddy admin API is responding

### Logs

View container logs:
```bash
docker-compose logs caddyshack-ui
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details.

## Acknowledgments 🙏

- Inspired by the 1980 movie "Caddyshack"
- Built for the Caddy web server community
- Thanks to all the groundskeepers who keep the greens perfect! 🏌️‍♂️

---

*"In the immortal words of Jean-Paul Sartre, 'Au revoir, gopher.'"* - Carl Spackler
