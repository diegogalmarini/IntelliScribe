# Testing Skills With Subagents

## Overview
Testing skills is TDD applied to process documentation.

## The Cycle

### 1. RED Phase: Baseline Testing
Run a scenario WITHOUT the skill.
Document the agent's failure and rationalizations (e.g., "I skipped tests because I was in a hurry").

### 2. GREEN Phase: Write Minimal Skill
Write just enough instructions to address the specific rationalizations you observed.
Run scenario WITH skill. Verify compliance.

### 3. REFACTOR Phase: Plug Holes
Identify new rationalizations (loopholes).
Add explicit counters (e.g., "Manual testing is NOT a substitute for unit tests").
Re-verify.

## Pressure Scenarios
Use realistic scenarios with 3+ pressures (e.g., time limit + sunk cost + late hour) to see if the skill holds up.
