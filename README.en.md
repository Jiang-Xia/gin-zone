<div align="center">
	<h1>🚀 Gin Zone</h1>
	<p>A Modern Full-Stack Development Practice Project</p>
	<p>Complete Implementation of Go + React + UniApp Tech Stack</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Go](https://img.shields.io/badge/Go-1.23.3-blue.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-latest-green.svg)](https://uniapp.dcloud.net.cn/)
[![Gin](https://img.shields.io/badge/Gin-1.10.0-blue.svg)](https://gin-gonic.com/)

## 📖 Project Introduction

Gin Zone is a full-stack development practice project based on modern technology stack, adopting a front-end and back-end separation architecture. It aims to provide developers with a complete learning and practice platform. The project covers multiple core functional modules including social dynamics, real-time chat, blog system, and backend management.

### 🎯 Project Features
- **🏗️ Modern Architecture**: Front-end and back-end separation with microservice design philosophy
- **📱 Cross-Platform**: Based on UniApp for H5, Mini Program, and APP multi-platform deployment
- **⚡ High-Performance Backend**: Go + Gin providing high-concurrency, low-latency API services
- **🎨 Modern Frontend**: React + TypeScript + Ant Design for management dashboard
- **💬 Real-Time Communication**: WebSocket-based real-time chat functionality
- **🔐 Complete Authentication**: JWT authentication + route guards security system
- **📊 Data Visualization**: Chart display and data analysis features
- **🚀 Engineering**: Husky + Commitlint standardized development workflow

## 🛠️ Tech Stack

### Backend Service (Server)
| Technology | Version | Description |
|------------|---------|-------------|
| Go | 1.23.3 | Programming Language |
| Gin | 1.10.0 | Web Framework |
| GORM | 1.25.12 | ORM Framework |
| MySQL | 8.0+ | Relational Database |
| Redis | latest | Cache Database |
| JWT | 4.5.1 | Authentication |
| WebSocket | latest | Real-time Communication |
| Swagger | 1.16.4 | API Documentation |
| Logrus | 1.9.3 | Logging |

### Frontend Management Dashboard (Admin)
| Technology | Version | Description |
|------------|---------|-------------|
| React | 18.2.0 | Frontend Framework |
| TypeScript | 4.4.2 | Type System |
| Ant Design | 5.4.0 | UI Component Library |
| Redux Toolkit | 1.9.3 | State Management |
| React Router | 6.x | Routing Management |
| Axios | 1.3.5 | HTTP Client |
| Craco | 7.1.0 | Build Tool |

### Cross-Platform Client (Client)
| Technology | Version | Description |
|------------|---------|-------------|
| Vue | 3.x | Frontend Framework |
| UniApp | latest | Cross-platform Framework |
| Vite | latest | Build Tool |
| uni-ui | latest | UI Component Library |
| dayjs | 1.11.13 | Date Processing |
| marked | 4.2.12 | Markdown Parser |
| prismjs | 1.29.0 | Code Highlighting |

## ✨ Core Features

### 🔐 User System
- User registration/login, WeChat OAuth login
- JWT token authentication, password encryption
- User profile management, avatar upload
- Permission control and route guards

### 📝 Dynamic Module
- Publish dynamics, image/video upload
- Like and view statistics, dynamic list display
- Geographic location tagging, time management
- Rich text editing, Markdown support

### 💬 Chat System
- WebSocket real-time communication
- Private chat/group chat functionality
- Friend management, chat history
- AI chat integration, emoji support

### 📱 Blog System
- Article publishing and management
- Markdown editor
- Code syntax highlighting
- Article categorization and tagging

### 📊 Data Display
- Chart visualization
- Data statistics and analysis
- Payment transfer demo
- QR code scanning

### 🔧 Management Dashboard
- Dynamic content management
- User information management
- Data statistics reports
- System configuration management

## 📁 Project Structure

```
gin-zone/
├── server/                 # Backend Service (Go + Gin)
│   ├── app/               # Application Core Code
│   │   ├── controller/    # Controller Layer
│   │   ├── service/       # Business Logic Layer
│   │   ├── model/         # Data Model
│   │   ├── cron/          # Scheduled Tasks
│   │   └── database/      # Database Configuration
│   ├── config/            # Configuration Files
│   ├── middleware/        # Middleware
│   ├── router/            # Route Configuration
│   ├── pkg/               # Utility Packages
│   ├── docs/              # API Documentation
│   ├── storage/           # Database Scripts
│   └── main.go            # Program Entry
├── admin/                 # Management Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── api/           # API Interfaces
│   │   ├── pages/         # Page Components
│   │   ├── components/    # Common Components
│   │   ├── redux/         # State Management
│   │   ├── routers/       # Route Configuration
│   │   └── utils/         # Utility Functions
│   └── package.json
├── client/                # Cross-platform Client (UniApp + Vue3)
│   ├── pages/             # Page Routes
│   ├── components/        # Custom Components
│   ├── uni_modules/       # UI Component Library
│   ├── stores/            # State Management
│   ├── common/            # Common Resources
│   ├── static/            # Static Assets
│   └── package.json
├── scripts/               # Automation Scripts
│   ├── install.sh         # Dependency Installation
│   └── run.sh             # Startup Script
└── package.json           # Root Configuration
```

## 🚀 Quick Start

### Environment Requirements
- **Go** 1.23.3+
- **Node.js** 16.0.0+
- **MySQL** 8.0+
- **Redis** latest
- **Git** latest

### One-Click Installation
```bash
# Clone project
git clone https://github.com/Jiang-Xia/gin-zone.git
cd gin-zone

# Install all dependencies
npm run i:all
# Or use script
bash ./scripts/install.sh
```

### Database Configuration
1. Create MySQL database
```sql
CREATE DATABASE zone_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import database structure
```bash
mysql -u root -p zone_db < server/storage/zone.sql
```

3. Import initial data (optional)
```bash
mysql -u root -p zone_db < server/storage/initData.sql
```

4. Configure environment variables
```bash
# Copy and modify configuration file
cp server/config/env.ini server/config/env.local.ini
# Modify database connection info according to your setup
```

### Start Services

#### One-Click Start All Services
```bash
npm run r:all
# Or use script
bash ./scripts/run.sh
```

#### Start Services Separately

**Backend Service**
```bash
cd server
# Development environment (recommended with Air hot reload)
air
# Or run directly
go run main.go
```

**Management Dashboard**
```bash
cd admin
npm start
# Default port: 3001
```

**Client**
```bash
cd client
# H5 development
npm run dev:h5
# WeChat Mini Program
npm run dev:mp-weixin
# Use HBuilderX (recommended)
# Open client folder with HBuilderX, click run
```

### Access URLs
- **Backend API**: http://localhost:9600
- **API Documentation**: http://localhost:9600/api/v1/swagger/index.html
- **Management Dashboard**: http://localhost:3001
- **Client H5**: http://localhost:3000

## 📱 Online Preview

### 🌐 Online Experience
- **H5 Version**: [Gin Zone](https://jiang-xia.top/zone/#/pages/blog/index)
- **Management Dashboard**: [Zone Admin](https://admin.jiang-xia.top)
- **API Documentation**: [Swagger Docs](https://jiang-xia.top/x-zone/api/v1/swagger/index.html)

### 📱 Mobile Experience
| WeChat Mini Program | APP Download |
|-------------------|-------------|
| <img src="https://jiang-xia.top/_nuxt/mini-program-code.7wTjEkFg.jpg" width="120"> | <img src="https://jiang-xia.top/_nuxt/app-code.Bsz8QBxF.png" width="120"> |
| Scan for Mini Program | Scan to Download APP |

## 📚 Detailed Documentation

### Server Side (For detailed docs see [server/README.md](./server/README.md))
- **Architecture Design**: MVC layered architecture, middleware pattern
- **API Interfaces**: RESTful API design, Swagger documentation
- **Database**: GORM + MySQL + Redis
- **Authentication**: JWT + WeChat login
- **Real-time Communication**: WebSocket chat system
- **Scheduled Tasks**: Cron task scheduling
- **Logging System**: Structured logging
- **File Upload**: Multimedia file processing

### Client Side (For detailed docs see [client/README.md](./client/README.md))
- **Cross-platform Development**: One codebase, multi-platform deployment
- **UI Components**: Rich uni-ui component library
- **State Management**: Vuex state management
- **Network Requests**: Unified API request wrapper
- **Rich Text**: Markdown parsing and code highlighting
- **Real-time Chat**: WebSocket client implementation
- **Encryption**: National cryptographic algorithm support
- **Multi-environment**: SIT/UAT/PROD environment configuration

### Admin Side (For detailed docs see [admin/README.md](./admin/README.md))
- **Modern UI**: React 18 + Ant Design 5
- **Type Safety**: Complete TypeScript type definitions
- **State Management**: Redux Toolkit
- **Routing Management**: React Router 6
- **Dynamic Management**: Social dynamic content management
- **User Authentication**: Multiple login methods
- **Data Display**: Advanced table and chart components

## 🚀 Deployment Guide

### Docker Deployment (Recommended)
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Traditional Deployment
```bash
# Backend compilation
cd server
go build -o zone-server main.go

# Frontend build
cd admin
npm run build

cd client
npm run build
```

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Commit Convention
This project uses [Conventional Commits](https://www.conventionalcommits.org/) specification:
```bash
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: refactoring
test: testing
chore: build/tools
```

## 🔗 Related Links

### Code Repositories
- **Gitee**: [gin-zone](https://gitee.com/jiang-xia/gin-zone)
- **GitHub**: [gin-zone](https://github.com/Jiang-Xia/gin-zone)

### Technical Documentation
- [Go Official Docs](https://golang.org/doc/)
- [Gin Framework Docs](https://gin-gonic.com/docs/)
- [React Official Docs](https://reactjs.org/docs/)
- [UniApp Official Docs](https://uniapp.dcloud.net.cn/)
- [Ant Design Components](https://ant.design/components/overview/)

## 📄 License

This project is licensed under the [MIT](./LICENSE) License.

## 👨‍💻 Author

**jiang-xia**
- Email: 963798512@qq.com
- Blog: [https://jiang-xia.top](https://jiang-xia.top)
- Gitee: [https://gitee.com/jiang-xia](https://gitee.com/jiang-xia)

---

⭐ If this project helps you, please give it a Star!
