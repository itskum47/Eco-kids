#!/bin/bash

# Phase 1 Integration Verification Script
# Run this to verify all Phase 1 components are properly integrated

echo "🧪 EcoKids India Phase 1 - Integration Verification"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_checks=0
passed_checks=0
failed_checks=0

# Function to check if file exists
check_file() {
  local file=$1
  local description=$2
  total_checks=$((total_checks + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $description"
    passed_checks=$((passed_checks + 1))
  else
    echo -e "${RED}❌${NC} $description - FILE NOT FOUND: $file"
    failed_checks=$((failed_checks + 1))
  fi
}

# Function to check if directory exists
check_dir() {
  local dir=$1
  local description=$2
  total_checks=$((total_checks + 1))
  
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✅${NC} $description"
    passed_checks=$((passed_checks + 1))
  else
    echo -e "${RED}❌${NC} $description - DIRECTORY NOT FOUND: $dir"
    failed_checks=$((failed_checks + 1))
  fi
}

# Function to check if line exists in file
check_line() {
  local file=$1
  local pattern=$2
  local description=$3
  total_checks=$((total_checks + 1))
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $description"
    passed_checks=$((passed_checks + 1))
  else
    echo -e "${RED}❌${NC} $description - PATTERN NOT FOUND in $file"
    failed_checks=$((failed_checks + 1))
  fi
}

echo "CHECKING DATABASE MODELS..."
echo "----------------------------"
check_file "server/models/EnvironmentalLesson.js" "EnvironmentalLesson model exists"
check_file "server/models/EcoPointsTransaction.js" "EcoPointsTransaction model exists"
check_line "server/models/User.js" "ecoPointsTotal" "User model has ecoPointsTotal field"
echo ""

echo "CHECKING CONTROLLERS..."
echo "----------------------"
check_file "server/controllers/environmentalLessonController.js" "environmentalLessonController exists"
check_file "server/controllers/ecoPointsController.js" "ecoPointsController exists"
check_line "server/controllers/environmentalLessonController.js" "getLessons" "getLessons function exists"
check_line "server/controllers/ecoPointsController.js" "getLeaderboard" "getLeaderboard function exists"
echo ""

echo "CHECKING BACKEND ROUTES..."
echo "-------------------------"
check_file "server/routes/environmentalLessons.js" "environmentalLessons routes exist"
check_file "server/routes/ecoPoints.js" "ecoPoints routes exist"
check_line "server/routes/environmentalLessons.js" "router.get" "Routes are defined"
check_line "server/routes/ecoPoints.js" "router.get" "Routes are defined"
echo ""

echo "CHECKING ROUTES MOUNTED IN server.js..."
echo "---------------------------------------"
check_line "server/server.js" "environmental-lessons" "environmental-lessons route mounted"
check_line "server/server.js" "/api/eco-points" "eco-points route mounted"
echo ""

echo "CHECKING FRONTEND COMPONENTS..."
echo "-------------------------------"
check_file "client/src/pages/EnvironmentalLessonsPage.jsx" "EnvironmentalLessonsPage exists"
check_file "client/src/pages/LessonDetail.jsx" "LessonDetail component exists"
check_file "client/src/components/EcoPointsDisplay.jsx" "EcoPointsDisplay component exists"
echo ""

echo "CHECKING FRONTEND STYLING..."
echo "----------------------------"
check_file "client/src/styles/EnvironmentalLessonsPage.css" "EnvironmentalLessonsPage CSS exists"
check_file "client/src/styles/LessonDetail.css" "LessonDetail CSS exists"
check_file "client/src/styles/EcoPointsDisplay.css" "EcoPointsDisplay CSS exists"
echo ""

echo "CHECKING APP.JSX INTEGRATION..."
echo "------------------------------"
check_line "client/src/App.jsx" "EnvironmentalLessonsPage" "EnvironmentalLessonsPage imported"
check_line "client/src/App.jsx" "LessonDetail" "LessonDetail imported"
check_line "client/src/App.jsx" "/environmental-lessons" "Environmental lessons route added"
check_line "client/src/App.jsx" "LessonDetail" "Lesson detail route added"
echo ""

echo "CHECKING DOCUMENTATION..."
echo "------------------------"
check_file "PHASE_1_IMPLEMENTATION_GUIDE.md" "Implementation guide exists"
check_file "PHASE_1_INTEGRATION_CHECKLIST.md" "Integration checklist exists"
check_file "PHASE_1_TESTING_GUIDE.md" "Testing guide exists"
check_file "PHASE_1_DELIVERY_SUMMARY.md" "Delivery summary exists"
echo ""

echo "=================================================="
echo "VERIFICATION SUMMARY"
echo "=================================================="
echo -e "Total Checks: $total_checks"
echo -e "${GREEN}Passed: $passed_checks${NC}"
echo -e "${RED}Failed: $failed_checks${NC}"
echo ""

if [ $failed_checks -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED! Phase 1 is properly integrated.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start backend: cd server && npm start"
  echo "2. Start frontend: cd client && npm run dev"
  echo "3. Open http://localhost:5173/environmental-lessons"
  echo "4. Create test data using the API"
  echo "5. Follow testing workflows in PHASE_1_TESTING_GUIDE.md"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
  echo ""
  echo "Issues to fix:"
  if ! [ -f "server/models/EnvironmentalLesson.js" ]; then
    echo "  - Create EnvironmentalLesson.js model"
  fi
  if ! [ -f "server/models/EcoPointsTransaction.js" ]; then
    echo "  - Create EcoPointsTransaction.js model"
  fi
  if ! grep -q "environmental-lessons" "server/server.js"; then
    echo "  - Mount environmental-lessons route in server.js"
  fi
  if ! grep -q "EnvironmentalLessonsPage" "client/src/App.jsx"; then
    echo "  - Import and add environmental lessons routes in App.jsx"
  fi
  exit 1
fi
