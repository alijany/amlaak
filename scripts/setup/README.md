# Setup Toolkit

A unified, modular server setup and configuration system that works for both local and remote deployments.

## Quick Start

```bash
./scripts/setup/main.sh
```

This launches an interactive wizard that will:
1. Ask if you want to deploy locally or to a remote server
2. Guide you through selecting which components to install
3. Execute the installation automatically

## Architecture

The toolkit uses a modular architecture:

- **`main.sh`** - Entry point that loads all modules
- **`commands/setup.sh`** - Unified setup wizard supporting local/remote
- **`modules/`** - Individual installation modules for each component
- **`lib/`** - Shared utility functions

### Execution Model

All prompts happen locally, but commands can execute either locally or remotely via SSH based on your choice. The `exec_cmd()` function handles routing commands to the appropriate target.

## Available Components

### DNS Configuration
- Installs and configures resolvconf
- Custom nameserver configuration
- Works on both local and remote

### Docker
- Installs Docker using official script
- Optional registry mirror configuration
- Non-root user permissions setup
- Works on both local and remote

### Drone CI/CD
- GitHub OAuth-integrated CI/CD server
- Includes runner container
- Customizable ports
- Works on both local and remote

### Portainer
- Docker management UI
- Custom port and volume configuration
- Works on both local and remote

### Traefik
- Reverse proxy with automatic HTTPS
- Let's Encrypt SSL certificates
- Optional dashboard with authentication
- HTTP to HTTPS redirect
-Works on both local and remote

### Cloudflare Tunnel (cloudflared)
- Secure tunnel to Cloudflare network
- **Local installation only** (requires interactive browser auth)
- System service or manual configuration

## Usage

### Interactive Setup (Default)

```bash
./scripts/setup/main.sh
# or simply:
./scripts/setup/main.sh setup
```

### Get Help

```bash
./scripts/setup/main.sh help
```

## Remote Deployment

When you choose remote deployment in the wizard, you'll be prompted for:

- **Remote host**: IP address or hostname
- **Remote user**: SSH username
- **SSH port**: Default 22
- **SSH identity file**: Optional path to private key

The wizard will test the SSH connection before proceeding.

### Requirements for Remote Deployment

- SSH access to the remote server
- Sudo privileges on the remote server
- SSH key authentication recommended

### How It Works

1. All user prompts happen on your local machine
2. Commands are executed on the remote server via SSH
3. Output is displayed locally
4. Installation proceeds just like a local setup

## Design Principles

- **Simplicity**: One command does everything
- **Modularity**: Each component is self-contained
- **Flexibility**: Works locally or remotely with the same code
- **Interactive**: Guides users through all choices
- **No hardcoding**: Generic and reusable for any server

## File Structure

```
scripts/setup/
├── main.sh                    # Entry point
├── commands/
│   └── setup.sh              # Unified setup wizard
├── lib/
│   ├── common.sh             # Shared utilities
│   └── ssh.sh                # SSH helper functions
└── modules/
    ├── cloudflared.sh        # Cloudflare Tunnel
    ├── dns.sh                # DNS configuration
    ├── docker.sh             # Docker installation
    ├── drone.sh              # Drone CI/CD
    ├── portainer.sh          # Portainer UI
    └── traefik.sh            # Traefik proxy
```

## Examples

### Local Server Setup

```bash
$ ./scripts/setup/main.sh
ℹ Server Setup Wizard

Deploy to remote server? (n=local) (y/n) [default: n]: n
ℹ Updating package index on local system...
Configure DNS (resolvconf)? (y/n) [default: n]: n
✓ Docker is already installed on local
Configure Docker registry mirror? (y/n) [default: n]: n
Configure Docker to run without sudo? (y/n) [default: y]: y
Install Drone CI/CD? (y/n) [default: n]: n
Install Portainer? (y/n) [default: n]: y
Install Traefik reverse proxy? (y/n) [default: y]: y
Install Cloudflare Tunnel (cloudflared)? (y/n) [default: n]: n

========================================
  Installation Summary
========================================
Target: local
----------------------------------------
○ DNS Configuration
○ Docker Installation
○ Docker Registry Mirror
✓ Docker User Permissions
○ Drone CI/CD
✓ Portainer
✓ Traefik Reverse Proxy
○ Cloudflare Tunnel
========================================
Proceed with installation? (y/n): y
```

### Remote Server Setup

```bash
$ ./scripts/setup/main.sh
ℹ Server Setup Wizard

Deploy to remote server? (n=local) (y/n) [default: n]: y
Remote host: 192.168.1.100
Remote user: ubuntu
SSH port [default: 22]: 22
SSH identity file (optional, press enter to skip): ~/.ssh/id_rsa
ℹ Testing SSH connection...
Connection successful
✓ Connected to remote server

ℹ Updating package index on remote system...
Configure DNS (resolvconf)? (y/n) [default: n]: y
...
```

## Notes

- **Cloudflared limitation**: Can only be installed locally due to interactive browser authentication
- **SSH keys**: Use SSH key authentication for remote setups (password auth may not work well with automation)
- **Sudo access**: Required on both local and remote systems
- **apt-based systems**: Currently supports Debian/Ubuntu-based distributions
