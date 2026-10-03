# Server Project

## Environment

* Ubuntu Server 26.04 LTS
* Git
* GitHub
* Docker
* Docker Compose
* Nginx
* Node.js / Express
* MongoDB NoSQL Database
* JWT Authentication

## Project Structure

```text
server-project/
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── nginx.conf
│   └── Dockerfile
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Architecture

```text
Client
  ↓
Frontend / Nginx
  ↓
Backend API / Express
  ↓
MongoDB NoSQL Database
```

## Features

* Personal profile page
* Admin login
* Edit personal profile
* MongoDB data storage
* JWT authentication
* Docker Compose deployment

## Security

* SSH Key Authentication
* UFW Firewall
* `.env` is ignored by Git
* MongoDB port is not exposed to the Internet
* Admin API uses JWT authentication

