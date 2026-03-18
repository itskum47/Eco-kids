# Tree Verification Spec

## Objective

Upgrade tree planting from one-time submission to longitudinal verification with species-aware tracking and staged rewards.

## New Data Models

- TreeSpecies
  - Region-tagged species metadata with CO2 capacity and growth attributes
- PlantedTree
  - Student planting record with selected species and future follow-up dates
- FollowUpTask
  - 3/6/12-month checkpoints with health status and teacher review state

## Endpoints

- GET /api/v1/trees/species?region=urban
- POST /api/v1/trees/plant
  - required: speciesId, photoUrl
  - creates PlantedTree + 3 FollowUpTask records
  - awards 50 points immediately
- POST /api/v1/trees/verify/:plantedTreeId
  - required: followUpNumber, photoUrl, health
  - marks follow-up submitted for review
- PUT /api/v1/trees/review/:followUpTaskId
  - teacher/admin review
  - approve awards staged points (25/35/50)
- GET /api/v1/trees/my-trees
  - returns tree timeline + summary

## Reward Ladder

- Planting accepted: +50
- 3-month verified follow-up: +25
- 6-month verified follow-up: +35
- 12-month verified follow-up: +50
- Max total: 160 points

## Validation Rules

- Species selection is mandatory for planting endpoint
- Region compatibility is validated against user state-inferred region
- Follow-up cannot be submitted before dueDate
- Follow-up must include photoUrl and health status

## Teacher Workflow

- Student submits follow-up -> status submitted
- Teacher approves/rejects with notes
- On approval: points are credited and student notified

## UI Contracts

- TreePlantingTask component:
  - region filter
  - mandatory species dropdown
  - species detail card
- TreeTracker component:
  - timeline per tree with follow-up states
  - verification form for due checkpoints
  - aggregate summary (count + CO2/year)
