#!/bin/bash
cd /home/kavia/workspace/code-generation/poweroutage-management-system-242368-242377/smart_outage_management_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

