# jiralike Ubuntu / Debian Packaging

Builds three `.deb` packages:
- `jiralike_0.1.deb`: FastCGI C++23 backend, SQLite migration scripts (`db/migrations/`), and systemd service.
- `jiralike-fe_0.1.deb`: Angular SPA production frontend bundle.
- `jiralike-config-nginx_0.1.deb`: Nginx virtual host configuration.

```bash
./build-all.sh
sudo dpkg -i jiralike_0.1.deb jiralike-fe_0.1.deb jiralike-config-nginx_0.1.deb
```
