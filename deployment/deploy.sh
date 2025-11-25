#!/bin/bash
# =============================================================================
# Activity Tracker - Production Deployment Script
# =============================================================================
# This script simplifies the deployment process for production environments
#
# Usage:
#   ./deploy.sh [command]
#
# Commands:
#   build     - Build the Docker images
#   start     - Start the containers
#   stop      - Stop the containers
#   restart   - Restart the containers
#   logs      - View container logs
#   status    - Check container status
#   update    - Pull latest code, rebuild, and restart
#   clean     - Remove containers and images (keeps data)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to script directory
cd "$SCRIPT_DIR"

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}Error: .env file not found!${NC}"
        echo "Please copy .env.example to .env and configure your environment variables:"
        echo "  cp .env.example .env"
        echo "  # Edit .env with your configuration"
        exit 1
    fi
}

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Build Docker images
build() {
    check_env
    print_message "$GREEN" "Building Docker images..."
    docker compose build
    print_message "$GREEN" "Build complete!"
}

# Start containers
start() {
    check_env
    print_message "$GREEN" "Starting containers..."
    docker compose up -d
    print_message "$GREEN" "Containers started!"
    print_message "$YELLOW" "Application will be available at: http://localhost:8080"
    print_message "$YELLOW" "Run './deploy.sh logs' to view logs"
}

# Stop containers
stop() {
    print_message "$YELLOW" "Stopping containers..."
    docker compose down
    print_message "$GREEN" "Containers stopped!"
}

# Restart containers
restart() {
    print_message "$YELLOW" "Restarting containers..."
    docker compose restart
    print_message "$GREEN" "Containers restarted!"
}

# View logs
logs() {
    docker compose logs -f
}

# Check status
status() {
    print_message "$GREEN" "Container Status:"
    docker compose ps
    echo ""
    print_message "$GREEN" "Health Status:"
    # Try to pretty-print JSON with jq, json_pp, or python; fallback to raw output
    if command -v jq &> /dev/null; then
        curl -s http://localhost:8080/health | jq 2>/dev/null || curl -s http://localhost:8080/health || echo "Health endpoint not available"
    elif command -v json_pp &> /dev/null; then
        curl -s http://localhost:8080/health | json_pp 2>/dev/null || curl -s http://localhost:8080/health || echo "Health endpoint not available"
    elif command -v python3 &> /dev/null; then
        curl -s http://localhost:8080/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/health || echo "Health endpoint not available"
    else
        curl -s http://localhost:8080/health || echo "Health endpoint not available"
    fi
}

# Update deployment
update() {
    print_message "$GREEN" "Updating deployment..."
    
    # Pull latest changes (if in git repo)
    if [ -d "$PROJECT_ROOT/.git" ]; then
        print_message "$YELLOW" "Pulling latest changes..."
        cd "$PROJECT_ROOT"
        git pull
        cd "$SCRIPT_DIR"
    fi
    
    # Rebuild and restart
    print_message "$YELLOW" "Rebuilding images..."
    docker compose build --no-cache
    
    print_message "$YELLOW" "Restarting containers..."
    docker compose down
    docker compose up -d
    
    print_message "$GREEN" "Update complete!"
}

# Clean up
clean() {
    print_message "$YELLOW" "This will remove all containers and images, but keep your data."
    printf "Are you sure? (y/N) "
    read -r REPLY
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "$YELLOW" "Cleaning up..."
        docker compose down
        docker compose rm -f
        print_message "$GREEN" "Cleanup complete!"
    else
        print_message "$YELLOW" "Cleanup cancelled."
    fi
}

# Show help
show_help() {
    cat << EOF
Activity Tracker - Production Deployment Script

Usage: ./deploy.sh [command]

Commands:
  build     - Build the Docker images
  start     - Start the containers
  stop      - Stop the containers
  restart   - Restart the containers
  logs      - View container logs (follow mode)
  status    - Check container and application status
  update    - Pull latest code, rebuild, and restart
  clean     - Remove containers and images (keeps data)
  help      - Show this help message

Examples:
  ./deploy.sh build && ./deploy.sh start    # First-time deployment
  ./deploy.sh update                         # Update to latest version
  ./deploy.sh logs                           # View logs
  ./deploy.sh status                         # Check if everything is running

Before first use:
  1. Copy .env.example to .env
  2. Edit .env with your configuration
  3. Run: ./deploy.sh build && ./deploy.sh start

EOF
}

# Main command handler
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    update)
        update
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_message "$RED" "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
