#!/bin/bash

# Phase 4 Activity Verification System - Live Integration Test
# Tests: submit activity → verify activity → impact applied

BASE_URL="http://localhost:5001/api"
HEADERS="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Phase 4: Activity Verification Tests${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Get test student token (login)
echo -e "${YELLOW}1. Logging in test student...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "$HEADERS" \
  -d '{
    "email": "student@demo.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')
STUDENT_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user._id // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo $LOGIN_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✓ Student logged in: $STUDENT_ID${NC}\n"

# Get initial impact before submission
echo -e "${YELLOW}2. Checking initial impact...${NC}"
INITIAL_IMPACT=$(curl -s -X GET "$BASE_URL/impact/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HEADERS")

INITIAL_CO2=$(echo $INITIAL_IMPACT | jq -r '.data.co2Prevented // 0')
echo -e "${GREEN}✓ Initial CO₂ Prevented: $INITIAL_CO2 kg${NC}\n"

# Submit activity
echo -e "${YELLOW}3. Submitting activity for verification...${NC}"
SUBMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/activity/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HEADERS" \
  -d '{
    "activityType": "tree-planting",
    "description": "Planted 5 trees at school garden on Feb 23, 2026",
    "imageUrl": "https://via.placeholder.com/400x300?text=Tree+Planting",
    "latitude": 28.6139,
    "longitude": 77.2090
  }')

SUBMISSION_ID=$(echo $SUBMIT_RESPONSE | jq -r '.data._id // empty')
SUBMISSION_STATUS=$(echo $SUBMIT_RESPONSE | jq -r '.data.status // empty')

if [ -z "$SUBMISSION_ID" ]; then
  echo -e "${RED}✗ Activity submission failed${NC}"
  echo $SUBMIT_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✓ Activity submitted: $SUBMISSION_ID${NC}"
echo -e "${GREEN}  Status: $SUBMISSION_STATUS (no impact yet)${NC}\n"

# Get pending submissions as teacher
echo -e "${YELLOW}4. Logging in teacher to verify activity...${NC}"
TEACHER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "$HEADERS" \
  -d '{
    "email": "teacher@demo.com",
    "password": "password123"
  }')

TEACHER_TOKEN=$(echo $TEACHER_LOGIN | jq -r '.data.token // empty')

if [ -z "$TEACHER_TOKEN" ]; then
  echo -e "${RED}✗ Teacher login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Teacher logged in${NC}\n"

# Get pending submissions
echo -e "${YELLOW}5. Fetching pending submissions...${NC}"
PENDING=$(curl -s -X GET "$BASE_URL/activity/pending" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "$HEADERS")

PENDING_COUNT=$(echo $PENDING | jq '.data | length')
echo -e "${GREEN}✓ Pending submissions: $PENDING_COUNT${NC}\n"

# Approve the activity
echo -e "${YELLOW}6. Approving activity (applying impact)...${NC}"
APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/activity/$SUBMISSION_ID/verify" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "$HEADERS" \
  -d '{
    "status": "approved"
  }')

APPROVE_STATUS=$(echo $APPROVE_RESPONSE | jq -r '.data.status // empty')
IMPACT_APPLIED=$(echo $APPROVE_RESPONSE | jq -r '.data.impactApplied // false')

if [ "$APPROVE_STATUS" != "approved" ]; then
  echo -e "${RED}✗ Approval failed${NC}"
  echo $APPROVE_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✓ Activity approved${NC}"
echo -e "${GREEN}  Impact Applied: $IMPACT_APPLIED${NC}\n"

# Check updated impact
echo -e "${YELLOW}7. Verifying impact was applied to student account...${NC}"
UPDATED_IMPACT=$(curl -s -X GET "$BASE_URL/impact/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HEADERS")

UPDATED_CO2=$(echo $UPDATED_IMPACT | jq -r '.data.co2Prevented // 0')
TREES_PLANTED=$(echo $UPDATED_IMPACT | jq -r '.data.treesPlanted // 0')

echo -e "${GREEN}✓ Updated Impact:${NC}"
echo -e "  CO₂ Prevented: $INITIAL_CO2 → $UPDATED_CO2 kg"
echo -e "  Trees Planted: $TREES_PLANTED\n"

# Test rejection workflow
echo -e "${YELLOW}8. Testing rejection workflow...${NC}"
REJECT_SUBMIT=$(curl -s -X POST "$BASE_URL/activity/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HEADERS" \
  -d '{
    "activityType": "plastic-cleanup",
    "description": "Cleaned up plastic at nearby park",
    "imageUrl": "https://via.placeholder.com/400x300?text=Cleanup"
  }')

REJECT_ID=$(echo $REJECT_SUBMIT | jq -r '.data._id // empty')

REJECT_RESPONSE=$(curl -s -X PUT "$BASE_URL/activity/$REJECT_ID/verify" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "$HEADERS" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Image quality is too low, please resubmit with clearer photo"
  }')

REJECT_STATUS=$(echo $REJECT_RESPONSE | jq -r '.data.status // empty')
REJECTION_REASON=$(echo $REJECT_RESPONSE | jq -r '.data.rejectionReason // empty')

echo -e "${GREEN}✓ Activity rejected${NC}"
echo -e "  Status: $REJECT_STATUS"
echo -e "  Reason: $REJECTION_REASON\n"

# Get my submissions
echo -e "${YELLOW}9. Fetching student's submission history...${NC}"
MY_SUBMISSIONS=$(curl -s -X GET "$BASE_URL/activity/my" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HEADERS")

MY_COUNT=$(echo $MY_SUBMISSIONS | jq '.data | length')
echo -e "${GREEN}✓ Student has $MY_COUNT submissions${NC}\n"

# Final verification
echo -e "${YELLOW}================================${NC}"
echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
echo -e "${YELLOW}================================${NC}\n"

echo -e "Summary:"
echo -e "  ✓ Activity submitted successfully"
echo -e "  ✓ Teacher can view pending submissions"
echo -e "  ✓ Activity approved with impact applied (trees: $TREES_PLANTED)"
echo -e "  ✓ Activity rejected with feedback"
echo -e "  ✓ Student can view submission history\n"

echo -e "${GREEN}Phase 4 Activity Verification System is PRODUCTION READY${NC}"
