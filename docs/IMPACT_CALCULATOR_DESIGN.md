# Impact Calculator Design

## Feature Goal

Provide a first-class personal impact flow with:
- Daily quick eco actions
- Periodic metrics (week/month/quarter/all-time)
- Baseline setup and monthly delta comparison
- Trend visualization

## UI Components

- MyEcoImpact: parent dashboard and period switching
- DailyChoices: one-tap action logging + custom action
- ImpactCard: reusable metric card
- ImpactComparison: baseline-vs-current summary + trend chart

Routes:
- /my-eco-impact

## Backend Endpoints

- POST /api/v1/impact/daily-action
  - logs quick action and increments environmentalImpact aggregate
- GET /api/v1/impact/me/metrics?period=month
  - period metrics from ImpactDailyAction aggregates
- GET /api/v1/impact/baseline
- POST /api/v1/impact/baseline
  - stores baseline and optional survey factors
- GET /api/v1/impact/comparison?period=month
  - baseline/current/delta payload
- GET /api/v1/impact/trend?months=6
  - month-wise trend for charting

## Data Model Additions

- User.impactBaseline
  - co2, water, plastic, energy, trees
  - sourceSurvey metadata
  - createdAt/updatedAt

- ImpactDailyAction collection
  - userId, actionType, actionDate
  - impact object
  - metadata

## Baseline Formula

If explicit baseline CO2 is not provided:
- showerCO2 = showerDuration * 1.5 * 0.08
- transportCO2 = 10 * factor(car=0.4,bus=0.05,bike/walk=0.01)
- meatCO2 = meatDaysPerWeek * 3
- waterCO2 = waterUsagePerDay * 0.001
- baselineCO2 = showerCO2 + transportCO2 + meatCO2 + waterCO2

## Delta Formula

- deltaCO2 = baseline.co2 - current.co2
- percentChange = (deltaCO2 / baseline.co2) * 100
- equivalentTrees = deltaCO2 / 20

## Notifications

- Immediate response message after daily action log
- Monthly milestone notification when CO2 reduction >= 10%

## QA Checklist

- Daily action writes ImpactDailyAction and updates User.environmentalImpact
- Metrics endpoint responds for each supported period
- Baseline can be set and fetched
- Comparison returns baseline/current/delta fields
- Trend endpoint returns chartable monthly rows
