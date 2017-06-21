#!/usr/bin/env sh

echo "Promoting ${1} to ${2}."
MATCHING_DEPLOY="$(now alias ls | grep "${1}" | tr -s ' ' | cut -d ' ' -f3)"

if [[ ! -z "${MATCHING_DEPLOY// }" ]]; then
  echo "Found ${MATCHING_DEPLOY}..."
  now alias set "${MATCHING_DEPLOY}" "${2}"
else
  echo "Unable to find deploy that matches ${1}"
fi
