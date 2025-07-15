#!/bin/bash

# Get Poetry environment path
VENV_PATH=$(poetry env info --path 2>/dev/null)

# Check if the path was found
if [ -z "$VENV_PATH" ]; then
  echo "❌ No virtual environment found. Did you run 'poetry install'?"
  exit 1
fi

# Activate the environment
ACTIVATE_PATH="$VENV_PATH/bin/activate"
if [ -f "$ACTIVATE_PATH" ]; then
  echo "✅ Activating Poetry environment at $VENV_PATH"
  source "$ACTIVATE_PATH"
else
  echo "❌ Could not find activate script at $ACTIVATE_PATH"
  exit 1
fi
