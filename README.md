# Cognitive Field Analyzer (CFA) - Nirvana Local Agent

> A lightweight, cross-platform distributed intelligence agent system for real-time network and system signal analysis with adaptive AI-driven insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17%2B-orange?logo=java)](https://www.java.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org)
[![Build Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)](./docs/ROADMAP.md)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Cognitive Stability Index (CSI)](#cognitive-stability-index-csi)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Nirvana Local Agent** (CFA - Cognitive Field Analyzer) is an enterprise-grade distributed intelligence system designed to monitor, analyze, and provide adaptive insights on network signals, system health, and environmental telemetry. Inspired by Nikola Tesla's analytical precision, the system converts invisible digital fields into measurable intelligence through proprietary entropy and variance formulas, enhanced with machine learning capabilities.

### Design Philosophy

The system operates on three core principles:
- **Distributed Architecture**: Independent microservices for scalability and fault isolation
- **Real-time Analysis**: Sub-second signal processing and adaptive scoring
- **AI-Driven Intelligence**: Integration with advanced LLM APIs for contextual insights

## Architecture

CFA follows a modern microservices architecture with three primary components:

### 1. **Java Core Agent** (`cfa-agent`)
- **Role**: High-performance signal collection and monitoring
- **Responsibilities**:
  - WiFi network scanning and signal strength monitoring
  - Bluetooth device discovery and connection analysis
  - Network packet inspection and traffic analysis
  - System resource monitoring (CPU, memory, disk I/O)
  - Real-time telemetry data collection
- **Technology Stack**: Java 17+, Spring Boot, JNI for OS-level access
- **Performance**: <100ms signal collection cycle
- **Platform Support**: Windows, macOS, Linux

### 2. **Python AI Microservice** (`cfa-ai`)
- **Role**: Intelligent signal processing and adaptive analysis
- **Responsibilities**:
  - Entropy and variance calculations on signal streams
  - Cognitive Stability Index (CSI) computation
  - Integration with Google Gemini API for advanced AI analysis
  - Machine learning model inference
  - Pattern recognition and anomaly detection
- **Technology Stack**: Python 3.10+, FastAPI, NumPy, Pandas, TensorFlow
- **API Endpoint**: `http://localhost:8000` (FastAPI)
- **Processing Latency**: <500ms per analysis request

### 3. **React Dashboard** (`cfa-ui`)
- **Role**: Real-time visualization and user interface
- **Responsibilities**:
  - Real-time signal monitoring dashboard
  - Interactive data visualization (charts, heat maps)
  - Historical analysis and trend reporting
  - System configuration management
  - Alert and notification display
- **Technology Stack**: React 18+, Vite, TailwindCSS, WebSocket
- **UI Theme**: Dark Void (futuristic scientific dashboard aesthetic)
- **Port**: `http://localhost:5173` (Development), port 3000 (Production)

### System Communication Flow

```
┌─────────────────┐
│  Java Agent     │ ─── Collects Signals ──→ (JSON/REST)
│  (Port 8080)    │
└─────────────────┘
         │
         ↓
    Signal Buffer
         │
    ┌────┴─────┐
    │           │
    ↓           ↓
┌──────────┐  ┌─────────────┐
│  Python  │  │   React     │
│   AI     │  │  Dashboard  │
│ (8000)   │  │  (5173)     │
└──────────┘  └─────────────┘
```

## Key Features

- ✅ **Real-time Signal Monitoring**: WiFi, Bluetooth, Network, and System signals
- ✅ **Distributed Processing**: Independent microservices for scalability
- ✅ **AI-Driven Analysis**: Adaptive scoring using advanced machine learning
- ✅ **Cross-Platform**: Native support for Windows, macOS, and Linux
- ✅ **REST API**: Comprehensive RESTful APIs for integration
- ✅ **WebSocket Streaming**: Real-time data push to dashboard
- ✅ **Cognitive Stability Index**: Proprietary algorithm for signal quality assessment
- ✅ **Historical Analytics**: Time-series data storage and analysis
- ✅ **Extensible Architecture**: Plugin system for custom analyzers
- ✅ **Enterprise Logging**: Structured logging with ELK stack support

## System Requirements

### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU Cores | 2 | 4+ |
| RAM | 2 GB | 8 GB |
| Storage | 500 MB | 10 GB |
| Network | 100 Mbps | 1 Gbps |

### Software Requirements
| Component | Version | Required |
|-----------|---------|----------|
| Java JDK | 17+ | ✅ |
| Python | 3.10+ | ✅ |
| Node.js | 20+ | ✅ |
| npm | 10+ | ✅ |
| Git | 2.30+ | ✅ |

### OS Compatibility
- **Windows**: 10/11 (Build 19041+) with Administrator privileges
- **macOS**: 11+ (Intel/Apple Silicon)
- **Linux**: Ubuntu 20.04+, Debian 10+, CentOS 8+

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/GOD-DEBANG/Nirvana_Local_Agent.git
cd Nirvana_Local_Agent
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Add your Google Gemini API key:
# GEMINI_API_KEY=your_api_key_here
```

### 3. Start All Services

```bash
# Option A: Using the provided startup script
./launch.bat              # Windows
./launch.sh               # macOS/Linux

# Option B: Manual startup (3 terminal windows)

# Terminal 1: Java Agent
cd cfa-agent
.\build.bat
java -jar cfa-agent.jar

# Terminal 2: Python AI
cd cfa-ai
pip install -r requirements.txt
python microservice.py

# Terminal 3: React Dashboard
cd cfa-ui
npm install
npm run dev
```

### 4. Access Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

## Installation

### Windows Installation

#### Prerequisites
```bash
# Install Java JDK 17+
# Install Python 3.10+
# Install Node.js 20+
# Install Git

# Verify installations
java -version
python --version
node --version
npm --version
```

#### Step-by-step Installation

```bash
# 1. Clone repository
git clone https://github.com/GOD-DEBANG/Nirvana_Local_Agent.git
cd Nirvana_Local_Agent

# 2. Setup Java Agent
cd cfa-agent
.\build.bat
cd ..

# 3. Setup Python AI
cd cfa-ai
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 4. Setup React UI
cd cfa-ui
npm install
cd ..

# 5. Start all services
.\launch.bat
```

### macOS Installation

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install java@17 python@3.10 node

# Verify installations
java -version
python3 --version
node --version

# Clone and setup (same as Linux below)
```

### Linux Installation (Ubuntu/Debian)

```bash
# Update package manager
sudo apt-get update

# Install dependencies
sudo apt-get install -y openjdk-17-jdk python3.10 python3.10-venv nodejs npm git

# Clone repository
git clone https://github.com/GOD-DEBANG/Nirvana_Local_Agent.git
cd Nirvana_Local_Agent

# Setup Java Agent
cd cfa-agent && bash build.sh && cd ..

# Setup Python
cd cfa-ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup Node
cd cfa-ui
npm install
cd ..

# Start services
chmod +x launch.sh
./launch.sh
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Java Agent Configuration
AGENT_PORT=8080
AGENT_HOST=0.0.0.0
SIGNAL_COLLECTION_INTERVAL_MS=1000
WIFI_SCAN_INTERVAL_MS=5000
BLUETOOTH_SCAN_INTERVAL_MS=10000

# Python AI Configuration
AI_PORT=8000
AI_HOST=0.0.0.0
AI_LOG_LEVEL=INFO
AI_MODEL_PATH=./models/csi_model.h5

# React Dashboard Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AGENT_URL=http://localhost:8080
VITE_PORT=5173

# Database Configuration (Optional)
DB_TYPE=sqlite
DB_PATH=./data/cfa.db

# Logging Configuration
LOG_LEVEL=INFO
LOG_DIR=./logs
LOG_FILE_SIZE_MB=100
LOG_RETENTION_DAYS=30
```

### Java Agent Configuration

Edit `cfa-agent/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api/v1

# Signal Collection Settings
signal.collection.interval=1000
signal.wifi.enabled=true
signal.bluetooth.enabled=true
signal.network.enabled=true
signal.system.enabled=true

# Data Retention
data.retention.hours=24
data.buffer.size=10000
```

### Python AI Configuration

Edit `cfa-ai/config.yaml`:

```yaml
server:
  host: 0.0.0.0
  port: 8000
  workers: 4

gemini:
  api_key: ${GEMINI_API_KEY}
  model: gemini-2.0-flash
  temperature: 0.7

csi:
  weights:
    signal_strength: 0.25
    stability: 0.25
    time_consistency: 0.20
    entropy: 0.15
    variance: 0.15
```

## Usage

### Starting Services

#### Using Launch Script (Recommended)

```bash
# Windows
.\launch.bat

# macOS/Linux
./launch.sh
```

#### Manual Start

```bash
# Terminal 1: Start Java Agent
cd cfa-agent
java -jar cfa-agent.jar

# Terminal 2: Start Python AI (after setting up venv)
cd cfa-ai
source venv/bin/activate  # macOS/Linux
# or .\venv\Scripts\activate  # Windows
python microservice.py

# Terminal 3: Start React Dashboard
cd cfa-ui
npm run dev
```

### Accessing the Dashboard

Open browser and navigate to:
```
http://localhost:5173
```

### Dashboard Features

- **Real-time Monitoring**: Live signal strength and quality metrics
- **Signal Trends**: Historical analysis of signal patterns
- **System Health**: CPU, memory, and network utilization
- **Alerts & Notifications**: Real-time anomaly detection alerts
- **Device Discovery**: Connected WiFi and Bluetooth devices
- **Analytics**: Advanced filtering and search capabilities

## API Reference

### Java Agent API

Base URL: `http://localhost:8080/api/v1`

#### Get Current Signal Status

```bash
GET /api/v1/signals/current
```

**Response:**
```json
{
  "timestamp": "2026-02-21T10:30:45.123Z",
  "signals": {
    "wifi": {
      "available_networks": 12,
      "connected": true,
      "signal_strength_dbm": -45,
      "noise_level": -95
    },
    "bluetooth": {
      "paired_devices": 5,
      "connected_devices": 2,
      "average_signal_dbm": -62
    },
    "network": {
      "upload_mbps": 450.5,
      "download_mbps": 650.3,
      "packet_loss_percent": 0.02
    },
    "system": {
      "cpu_usage_percent": 15.3,
      "memory_usage_percent": 42.1,
      "disk_usage_percent": 68.5
    }
  }
}
```

#### Get Signal History

```bash
GET /api/v1/signals/history?start_time=2026-02-21T00:00:00Z&end_time=2026-02-21T10:00:00Z&limit=100
```

**Parameters:**
- `start_time` (ISO 8601): Start of time range
- `end_time` (ISO 8601): End of time range
- `limit` (integer): Max records to return (default: 100, max: 10000)

#### Start WiFi Scan

```bash
POST /api/v1/commands/wifi-scan
```

**Response:**
```json
{
  "scan_id": "scan_1708854645123",
  "status": "started",
  "estimated_duration_seconds": 5
}
```

### Python AI API

Base URL: `http://localhost:8000`

#### Calculate Cognitive Stability Index

```bash
POST /api/analyze/csi
Content-Type: application/json

{
  "signal_strength": -45,
  "stability_score": 0.92,
  "time_consistency": 0.88,
  "noise_level": -95,
  "entropy": 0.34,
  "variance": 0.12
}
```

**Response:**
```json
{
  "csi_score": 0.87,
  "confidence": 0.95,
  "status": "OPTIMAL",
  "recommendations": [
    "Signal strength is excellent",
    "Minor interference detected in 2.4GHz band"
  ],
  "timestamp": "2026-02-21T10:30:45.123Z"
}
```

#### Get AI Analysis with Gemini

```bash
POST /api/analyze/enhanced
Content-Type: application/json

{
  "signal_data": {...},
  "context": "WiFi network optimization"
}
```

**Response:**
```json
{
  "analysis": "Detailed AI-generated insights...",
  "recommendations": [...],
  "severity_level": "INFO",
  "timestamp": "2026-02-21T10:30:45.123Z"
}
```

### WebSocket API

Connect to real-time signal stream:

```javascript
// JavaScript Example
const ws = new WebSocket('ws://localhost:8000/ws/signals');

ws.onmessage = (event) => {
  const signalData = JSON.parse(event.data);
  console.log('Signal Update:', signalData);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Cognitive Stability Index (CSI)

### Formula

```
CSI = (w₁ × S + w₂ × Stb + w₃ × TC - w₄ × N - w₅ × E) × V

Where:
- S    = Signal Strength (normalized 0-1)
- Stb  = Stability coefficient
- TC   = Time Consistency
- N    = Noise impact factor
- E    = Entropy value
- V    = Variance dampening
- w₁-₅ = Configurable weights
```

### Interpretation

| CSI Score | Status | Interpretation |
|-----------|--------|-----------------|
| 0.90-1.00 | OPTIMAL | Excellent signal quality, minimal interference |
| 0.70-0.89 | GOOD | Good signal quality, minor interference possible |
| 0.50-0.69 | FAIR | Acceptable signal, consider optimization |
| 0.30-0.49 | POOR | Poor signal quality, interference detected |
| 0.00-0.29 | CRITICAL | Critical signal degradation, immediate action needed |

### Configuration

Edit `cfa-ai/config.yaml` to adjust weights:

```yaml
csi:
  weights:
    signal_strength: 0.25      # Increase for signal-heavy analysis
    stability: 0.25            # Increase for stability-critical systems
    time_consistency: 0.20     # Temporal reliability weight
    entropy: 0.15              # Information disorder weight
    variance: 0.15             # Fluctuation dampening
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Java Agent won't start

```bash
# Check if port 8080 is in use
# Windows
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080

# Kill process if needed
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

**Solution**: Change port in `.env` or configuration file

#### Issue: Python AI shows "Gemini API key invalid"

```bash
# Verify API key is set
echo $GEMINI_API_KEY  # macOS/Linux
echo %GEMINI_API_KEY%  # Windows

# Update .env file with correct key
# Restart service
```

#### Issue: React Dashboard won't connect to backend

```bash
# Check if backend services are running
curl http://localhost:8080/api/v1/health
curl http://localhost:8000/health

# Verify CORS settings in backend
# Check browser console for CORS errors
# Ensure correct URLs in environment variables
```

#### Issue: High CPU usage

```
1. Check signal collection interval in config
2. Reduce collection frequency
3. Monitor log files for errors
4. Check for stuck threads: jstack <pid>
5. Profile with Java Flight Recorder
```

#### Issue: Memory leak detected

```bash
# Generate heap dump
jmap -dump:live,format=b,file=heap.bin <pid>

# Analyze with Eclipse Memory Analyzer or jhat
jhat heap.bin

# Check for common issues:
# - Unbounded caches
# - Circular references
# - Resource leaks
```

### Debug Mode

Enable debug logging:

```bash
# Java Agent
java -Xmx2g -Xms1g -XX:+PrintGCDetails -jar cfa-agent.jar --debug

# Python AI
export LOG_LEVEL=DEBUG
python microservice.py --debug

# React
VITE_DEBUG=true npm run dev
```

### Log Files Location

```
./logs/
├── agent/
│   ├── agent.log
│   └── gc.log
├── ai/
│   ├── microservice.log
│   └── analysis.log
└── ui/
    └── dashboard.log
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Code Standards

- **Java**: Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- **Python**: Follow [PEP 8](https://pep8.org/)
- **JavaScript/React**: Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(csi): implement variance dampening algorithm

- Added exponential moving average calculation
- Improved numerical stability for extreme values
- Added comprehensive unit tests

Fixes #123
```

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'feat(module): Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request with detailed description
6. Ensure all CI/CD checks pass
7. Request review from maintainers

### Testing

```bash
# Run all tests
./run_tests.sh

# Java tests
mvn test

# Python tests
pytest cfa-ai/tests/ -v --cov

# React tests
npm test
```

### Documentation

- Update README.md for user-facing changes
- Add API documentation for new endpoints
- Include architecture diagrams for major changes
- Update CHANGELOG.md

## Performance Benchmarks

| Metric | Value | Notes |
|--------|-------|-------|
| Signal Collection Latency | <100ms | Per cycle |
| AI Analysis Time | <500ms | Per request |
| Dashboard Update Rate | 1000ms | Configurable |
| Memory Footprint | ~400-600MB | All services combined |
| CPU Usage (Idle) | 2-5% | Per core |
| Maximum Signals/sec | 10,000+ | With 8GB RAM |

## Security Considerations

- All traffic between services should be HTTPS in production
- API keys must be stored in environment variables (never in code)
- Implement rate limiting on public APIs
- Use firewall rules to restrict access
- Enable audit logging for compliance
- Rotate API keys regularly
- Run services with minimal required privileges

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use this project in your research or production environment, please cite:

```bibtex
@software{cfa2026,
  title={Cognitive Field Analyzer: Distributed Intelligence Agent},
  author={GOD-DEBANG},
  year={2026},
  url={https://github.com/GOD-DEBANG/Nirvana_Local_Agent}
}
```

## Support & Community

- **Issues**: [GitHub Issues](https://github.com/GOD-DEBANG/Nirvana_Local_Agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GOD-DEBANG/Nirvana_Local_Agent/discussions)
- **Documentation**: [Wiki](https://github.com/GOD-DEBANG/Nirvana_Local_Agent/wiki)
- **Email**: support@nirvanaloal.example.com

## Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for planned features and development timeline.

## Acknowledgments

- Inspired by Nikola Tesla's analytical methodologies
- Built with modern distributed systems principles
- Leverages cutting-edge AI/ML technologies

---

**Last Updated**: 2026-02-21
**Maintained By**: GOD-DEBANG Team  
**Status**: Active Development
