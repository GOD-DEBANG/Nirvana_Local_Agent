@echo off
echo [CFA Build] Compiling Java sources...
set SRC=src\main\java\com\cfa
set OUT=out\com\cfa
mkdir out 2>nul
mkdir %OUT% 2>nul

javac -d out %SRC%\*.java

if %ERRORLEVEL% NEQ 0 (
    echo [CFA Build] COMPILATION FAILED
    exit /b 1
)

echo [CFA Build] Packaging JAR...
copy cfa.properties out\ >nul 2>&1
jar cfe cfa-agent.jar com.cfa.AgentMain -C out .

echo [CFA Build] Done! Run with: java -jar cfa-agent.jar
