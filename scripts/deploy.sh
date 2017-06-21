#!/usr/bin/env sh

echo "Deploying to new environment..."
now --dotenv

if [ $? -eq 0 ]; then
  LAST_ID="$(now ls | head -n 6 | tail -n 1 | sed -e 's/ *//' -e 's/ .*//g')"
  echo "Aliasing deployment ${LAST_ID} to ${1}..."
  now alias set $LAST_ID $1
fi
