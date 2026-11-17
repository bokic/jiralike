# Jira-Like (`jiralike`)

A fast, lightweight, self-hosted project management tool inspired by Jira. Built for teams who want powerful issue tracking and agile workflows without the clutter or licensing fees.

---

## ✨ Features

- **Agile Boards & Sprints**: Interactive Scrum and Kanban boards with drag-and-drop, customizable columns, and backlog planning.
- **Issue Tracking**: Epics, stories, tasks, bugs, subtasks, custom fields, and file attachments.
- **Search & Filters**: Search using JQL (Jira Query Language), text search, and saved filters.
- **Visual Workflows**: Customizable statuses, transitions, and rules.
- **Roadmaps & Timelines**: Interactive Gantt charts to track progress, milestones, and dependencies.
- **Dashboards & Reports**: Burndown charts, velocity tracking, and customizable dashboards.
- **Automations**: No-code rule builder to auto-assign tasks, update fields, or send notifications.
- **Service Desk & Customer Portal**: Dedicated request portal with SLA tracking.
- **Git & Developer Tools**: Link commits, branches, and pull requests directly to issues.
- **Team-Ready**: Dark mode, multi-language support (i18n), two-factor authentication (2FA), and SSO.

---

## 🚀 Quick Start

The fastest way to run the application:

```bash
./run.sh
```

Then open your browser at **[http://localhost:4200](http://localhost:4200)**.

On first launch, a setup wizard will guide you through creating your admin account and first project.

### Useful `run.sh` options
- `./run.sh -p 8080` – Change web server port (default: `4200`)
- `./run.sh -b` – Force rebuild backend and frontend before starting
- `./run.sh -h` – Show all available options

---

## 🐳 Docker

Run with Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Access the app at **[http://localhost:8082](http://localhost:8082)**.

---

## 🛠️ Building from Source

If you prefer building manually:

### Prerequisites
- **C++ Compiler** with C++23 support (GCC 13+ or Clang 16+)
- **CMake** 3.16+
- **Libraries**: `libfcgi-dev`, `libsqlite3-dev`, `libjson-c-dev`
- **Node.js** 20+ & **npm**

### Build Steps

1. **Build Backend**:
   ```bash
   ./build.sh
   ```

2. **Build Frontend**:
   ```bash
   cd web
   npm install
   npm run build
   cd ..
   ```

3. **Start**:
   ```bash
   ./run.sh
   ```

---

## 📖 API Documentation

Interactive Swagger API documentation is available at **[http://localhost:4200/api/docs](http://localhost:4200/api/docs)** when the server is running.
