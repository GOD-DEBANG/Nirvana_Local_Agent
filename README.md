# Cognitive Field Analyzer (CFA)

A lightweight, cross-platform Local Intelligence Agent inspired by Nikola Tesla's analytical precision.

## Architecture

- **Java Core Agent**: Service that monitors WiFi, Bluetooth, Network, and System signals.
- **Python AI Microservice**: Microservice that applies entropy/variance formulas and connects to Gemini API for adaptive scoring.
- **React Dashboard**: Futuristic dashboard inspired by scientific dashboards (Dark Void aesthetic).

## Prerequisites

- **Java**: JDK 17+
- **Python**: 3.10+
- **Node.js**: 20+

## Setup & Startup

### 1. Java Agent
```bash
cd cfa-agent
.\build.bat     # Compiles and packages JAR
java -jar cfa-agent.jar
```

### 2. Python AI
```bash
cd cfa-ai
pip install -r requirements.txt
# Add your Gemini API key to .env
python microservice.py
```

### 3. React Dashboard
```bash
cd cfa-ui
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## Philosophy: Cognitive Stability Index (CSI)
CSI observes invisible digital fields and converts them into measurable intelligence using a proprietary formula tracking Signal Strength, Stability, Time Consistency, Noise, Entropy, and Variance.
