#!/usr/bin/env bash
# Starts the Live Demo backend. Run from anywhere: `./backend/run.sh` or
# `bash run.sh` from inside backend/.
set -e
cd "$(dirname "$0")/app"
exec ../.venv/bin/uvicorn main:app --reload --port 8010
