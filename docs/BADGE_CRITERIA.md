# Badge Criteria Reference

This document defines all production badge unlock rules for EcoKids India.

## Evaluation Rules

- Badge checks run when approved activities award points and during gamification evaluation jobs.
- Activity-based badges count only approved submissions: `teacher_approved` and legacy `approved`.
- "Window" means rolling days from now (for example, 30-day window means last 30 days).
- Quiz mastery uses the student's `progress.quizzesTaken` count and average score.
- Class rank badges are calculated using EcoPoints ranking among active students in the same school and grade.

## Badge Catalog (25)

| Badge ID | Category | Badge Name | Quantitative Criteria | Points |
|---|---|---|---|---:|
| water-1 | Water Conservation | Droplet Saver | Total water saved >= 100 L | 25 |
| water-2 | Water Conservation | Drought Fighter | Total water saved >= 500 L | 50 |
| water-3 | Water Conservation | Ocean Guardian | Total water saved >= 1000 L | 75 |
| energy-1 | Energy Pioneer | Light Switch Pro | Approved `energy-saving` activities >= 10 in last 30 days | 30 |
| energy-2 | Energy Pioneer | Renewable Advocate | Approved `energy-saving` activities >= 30 in last 90 days | 60 |
| energy-3 | Energy Pioneer | Carbon Neutral | Approved `energy-saving` activities >= 50 in last 180 days | 100 |
| waste-1 | Waste Master | Sort Starter | Total plastic reduced >= 5 kg | 25 |
| waste-2 | Waste Master | Recycle Warrior | Total plastic reduced >= 25 kg | 50 |
| waste-3 | Waste Master | Zero Waste Champion | Total plastic reduced >= 100 kg | 75 |
| bio-1 | Biodiversity | Seed Planter | Trees planted >= 5 | 35 |
| bio-2 | Biodiversity | Forest Builder | Trees planted >= 25 | 60 |
| bio-3 | Biodiversity | Green Guardian | Trees planted >= 100 | 100 |
| community-1 | Community Leader | Cleanup Captain | Approved `sutlej-cleanup` activities >= 1 | 40 |
| community-2 | Community Leader | Environmental Hero | Approved `sutlej-cleanup` activities >= 5 | 80 |
| knowledge-1 | Knowledge Master | Eco Scholar | Quizzes taken >= 10 and average quiz score >= 70% | 20 |
| knowledge-2 | Knowledge Master | Nature Expert | Quizzes taken >= 50 and average quiz score >= 75% | 50 |
| knowledge-3 | Knowledge Master | Sustainability PhD | Quizzes taken >= 100 and average quiz score >= 80% | 80 |
| streak-1 | Streak Medal | Week Warrior | Active days >= 7 in last 7 days | 15 |
| streak-2 | Streak Medal | Month Maven | Active days >= 30 in last 30 days | 30 |
| streak-3 | Streak Medal | Year Champion | Active days >= 350 in last 365 days | 150 |
| social-1 | Social Badge | Friend Finder | Approved `sutlej-cleanup` + `nature-walk` activities >= 10 | 10 |
| social-2 | Social Badge | Class Champion | Class rank <= 3 by EcoPoints | 25 |
| seasonal-1 | Seasonal Badge | Climate Advocate | Approved climate actions >= 5 in months Apr-Jun (`air-quality-monitoring`, `energy-saving`) | 20 |
| seasonal-2 | Seasonal Badge | Winter Warrior | Approved `energy-saving` activities >= 5 in months Dec-Feb | 20 |
| seasonal-3 | Seasonal Badge | Monsoon Guardian | Approved water actions >= 5 in months Jul-Sep (`water-conservation`, `groundwater-conservation`) | 20 |

## Progress Computation Examples

- Droplet Saver progress percent:
  - `progress = min(100, (waterSaved / 100) * 100)`
- Eco Scholar progress percent:
  - `quizProgress = min(100, (quizCount / 10) * 100)`
  - `scoreProgress = min(100, (avgQuizScore / 70) * 100)`
  - `overallProgress = min(quizProgress, scoreProgress)`
- Class Champion progress:
  - If rank is 8, target is <= 3, then distance to unlock is `8 - 3 = 5 places`.

## QA Checklist

- Seed data inserts 25 badges successfully.
- Each badge has explicit numeric criteria.
- Badge unlocks exactly at threshold boundaries.
- No duplicate badge awards for the same user.
- Badge notification appears after unlock.
- Badge unlock persists in `gamification.badges`.
