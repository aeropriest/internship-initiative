#!/bin/bash

# Default API token or use the one provided as argument
API_TOKEN=${1:-"51ce36b3ac06f113f418f0e0f47391e7471090c7"}
BASE_URL="https://api.manatal.com/open/v3"

echo "🔑 Using API Token: ${API_TOKEN:0:5}..."
echo

# Test candidates endpoint
echo "🔍 Testing candidates endpoint"
curl -s -X GET "${BASE_URL}/candidates/" \
  -H "Authorization: Token ${API_TOKEN}" \
  -H "Content-Type: application/json" | jq '.' || echo "Failed to parse JSON response"
echo

# Test positions endpoint
echo "🔍 Testing positions endpoint"
curl -s -X GET "${BASE_URL}/positions/" \
  -H "Authorization: Token ${API_TOKEN}" \
  -H "Content-Type: application/json" | jq '.' || echo "Failed to parse JSON response"
echo

# Test status endpoint (if available)
echo "🔍 Testing status endpoint"
curl -s -X GET "${BASE_URL}/status/" \
  -H "Authorization: Token ${API_TOKEN}" \
  -H "Content-Type: application/json" | jq '.' || echo "Failed to parse JSON response"
echo

echo "✨ API testing completed"
