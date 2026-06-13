# Project Nova — Live Demo Dataset

Use this for the **live upload demo** at the end of your presentation.

## The Story

Project Nova is a fintech mobile app with a hard launch deadline.
It has a mix of realistic problems that make for a compelling live analysis:

- PCI-DSS compliance not completed → blocks entire payment flow
- Fraud detection model underperforming (23% false positive rate)
- KYC vendor changed API terms mid-sprint
- 3 scope additions in one week (crypto wallet, referral program, dark mode)
- iOS App Store review timeline not in the schedule
- QA environment randomly failing — blocks regression testing

**Expected result:** Health score ~45-55, High risk, 3-4 week predicted delay

## Files

| File | Description |
|------|-------------|
| `tasks.csv` | 14 tasks across mobile, backend, data science, legal, QA |
| `meeting_notes.txt` | Sprint 4 review with detailed risk discussion |
| `project_updates.csv` | 12 daily updates showing risk escalation |

## Demo Script for Live Upload

1. Say: *"Now let me show you a real scenario — a fintech app called Project Nova"*
2. Open `http://localhost:3000`
3. Type **Project Nova** in the project name field
4. Upload `tasks.csv` → `meeting_notes.txt` → `project_updates.csv`
5. Click **Analyze Project**
6. While it loads: *"The AI is now running all 7 agents in parallel — risk detection, resource analysis, scope creep, dependencies..."*
7. Show the result and say: *"PCI-DSS compliance, fraud model issues, scope creep — the AI found all of it. And it's recommending exactly what a senior delivery manager would recommend."*
