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

### Option 1: Using Pre-built Image (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/loryanstrant/caddyshack.git
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

### Option 2: Building Locally

If you prefer to build the image yourself:

1. **Follow steps 1-3 from Option 1**

2. **Modify docker-compose.yml** to build locally:
   ```yaml
   services:
     caddyshack-ui:
       build: .  # Uncomment this line
       # image: ghcr.io/loryanstrant/caddyshack:latest  # Comment this line
   ```

3. **Build and start:**
   ```bash
   docker-compose up -d --build
   ```

### Option 3: Using Docker Run

You can also run the container directly:

```bash
docker run -d \
  --name caddyshack-ui \
  -p 8080:3000 \
  -e TZ=America/New_York \
  -e CADDY_ADMIN_ENDPOINT=http://host.docker.internal:2019 \
  -v ./Caddyfile:/caddy/Caddyfile \
  -v caddyfile_backups:/app/backups \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/loryanstrant/caddyshack:latest
```

## Installation Options 📦

### Pre-built Docker Image

The easiest way to get started is using the pre-built image from GitHub Container Registry:

```bash
docker pull ghcr.io/loryanstrant/caddyshack:latest
```

**Available tags:**
- `latest` - Latest stable release from main branch
- `v1.0.0`, `v1.0`, `v1` - Semantic version tags
- `main` - Latest development build

### Building from Source

Clone and build locally if you want to modify the code:

```bash
git clone https://github.com/loryanstrant/caddyshack.git
cd caddyshack
docker build -t caddyshack-ui .
```

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
# Pull the pre-built image
docker pull ghcr.io/loryanstrant/caddyshack:latest

# Or build Docker image locally
docker build -t caddyshack-ui .

# Or use docker-compose (will use pre-built image by default)
docker-compose build
```

## Deployment 🚀

### Multi-Architecture Support

The pre-built images support multiple architectures:
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, including Apple Silicon and Raspberry Pi)

### Production Deployment

For production use, pin to a specific version:

```yaml
services:
  caddyshack-ui:
    image: ghcr.io/loryanstrant/caddyshack:v1.0.0  # Pin to specific version
```

### Docker Compose for Production

```yaml
version: '3.8'

services:
  caddyshack-ui:
    image: ghcr.io/loryanstrant/caddyshack:latest
    container_name: caddyshack-ui
    restart: unless-stopped
    ports:
      - "8080:3000"
    environment:
      - TZ=America/New_York
      - CADDYFILE_PATH=/caddy/Caddyfile
      - CADDY_ADMIN_ENDPOINT=http://caddy-server:2019
    volumes:
      - ./Caddyfile:/caddy/Caddyfile:ro
      - caddyfile_backups:/app/backups
    networks:
      - caddy-network
    depends_on:
      - caddy-server
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  caddyfile_backups:

networks:
  caddy-network:
    external: true
```

## CI/CD Pipeline 🔄

This project uses GitHub Actions to automatically build and publish Docker images to GitHub Container Registry (GHCR).

> **Note**: Every push to the main branch automatically triggers a new Docker build and publishes the latest image to GHCR.

### Automatic Builds

- **Push to main/master**: Creates `latest` and `main` tags
- **Pull requests**: Creates PR-specific tags for testing
- **Git tags**: Creates semantic version tags (e.g., `v1.0.0`, `v1.0`, `v1`)

### Manual Build

To trigger a manual build, create and push a new tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

### Container Registry

Images are published to: `ghcr.io/loryanstrant/caddyshack`

View all available tags: https://github.com/loryanstrant/caddyshack/pkgs/container/caddyshack

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
