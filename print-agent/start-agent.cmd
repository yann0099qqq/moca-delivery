@echo off
cd /d "%~dp0"
if not exist logs mkdir logs
node src\index.mjs >> logs\agent.log 2>&1
