import os
import subprocess
import sys
import time
import signal

# Paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JAR_PATH = os.path.join(BASE_DIR, "bin", "cfa-agent.jar")
AI_DIR   = os.path.join(BASE_DIR, "ai")
AI_SCRIPT = os.path.join(AI_DIR, "microservice.py")

processes = []

def signal_handler(sig, frame):
    print("\n[Nirvana] Shutting down services...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def start_services():
    print("[Nirvana] Starting local agent services...")
    
    # 1. Start Java Agent
    print(f"[Nirvana] Launching Java Agent (Background)...")
    agent_proc = subprocess.Popen(
        ["java", "-jar", JAR_PATH],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        cwd=BASE_DIR
    )
    processes.append(agent_proc)
    
    # 2. Start Python AI Microservice
    print(f"[Nirvana] Launching AI Engine (Background)...")
    ai_proc = subprocess.Popen(
        [sys.executable, AI_SCRIPT],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        cwd=AI_DIR
    )
    processes.append(ai_proc)
    
    print("[SUCCESS] Nirvana services are running.")
    print("[HINT] Press Ctrl+C to stop all services.")
    
    while True:
        time.sleep(1)

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "start":
        start_services()
    else:
        print("Usage: nirvana-agent start")

if __name__ == "__main__":
    main()
