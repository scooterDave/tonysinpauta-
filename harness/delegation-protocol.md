# Manager-to-Subagent Delegation Protocol — `tonysinpauta.com`

This protocol defines how the **Development Manager** delegates tasks to specialist subagents, isolates parallel edits with git worktrees, manages context hygiene, and verifies evidence before merging.

---

## 1. Parallelism Rules (When to Fan Out vs. Sequence)

Default to **one writer at a time** unless ALL four conditions hold:
1. Shared contracts (`tokens.css`, content schemas, `BaseLayout`, `package-lock.json`) are **frozen** on the base branch.
2. Each parallel task has **strictly disjoint `ownedPaths`** — zero file overlap.
3. Each task has an independent, runnable verification command.
4. Concurrent writer count stays **<= 3** (to prevent review bottlenecks and token burn).

**Read-only fan-out** (channel research, asset audits, independent QA reviews) can run in parallel at any time without worktrees.

---

## 2. Git Worktree & Runtime Isolation Rules

Never let two writer agents share one working directory. Each writer subagent gets its own worktree, branch, and dev-server port:

```bash
# Manager creates worktree before spawning writer subagent (example for Slot 1 = T3-01)
git worktree add ../wt-T3-01 -b feat/T3-01-home-videos main

# Deterministic port allocation (prevents EADDRINUSE collisions in parallel Playwright/dev runs)
# Base checkout: 4173 | Slot 1 (T3-01): 4174 | Slot 2 (T3-02): 4175 | Slot 3 (T3-03): 4176
# e.g. npm run dev -- --port 4174  →  http://localhost:4174/tonysinpauta-/
```

### Mandatory Worktree Safeguards
1. **Tracked Instructions Only:** `AGENTS.md` and `harness/**` must be committed in git (never `.gitignore`d) so every new worktree automatically receives them.
2. **Branch Assertion Before Commit:** Before staging/committing, the subagent must assert its expected branch:
   ```bash
   test "$(git branch --show-current)" = "feat/T3-01-home-videos"
   ```
3. **No Shared Lockfile Edits in Parallel:** Only one designated task (Phase 0 or Phase 2) owns `package.json` / `package-lock.json`. Parallel Phase 3 builders may **not** install new npm packages; if a package is needed, escalate to the Manager.
4. **Serialize Git Maintenance:** Never run `git fetch`, `git gc`, or `git worktree prune` concurrently from subagents. Only the Development Manager runs fetch/rebase/merge/prune operations.
5. **No Silent Fallback:** If worktree creation fails, stop and report — never fall back to editing the primary checkout while another writer is active.

---

## 3. Manager-to-Subagent Task Brief Template

Copy and fill every field before launching a subagent. Keep the brief self-contained — subagents start with a clean context window and cannot see prior chat history.

```markdown
### Task Delegation Brief
- **Task ID:** <e.g., T3-01>
- **Phase:** <0–5>
- **Assigned Role:** <asset-content-curator | design-system-architect | frontend-builder | qa-visual-a11y-verifier | perf-seo-deploy-specialist>
- **Working Directory / Worktree:** <absolute path to worktree>
- **Git Branch:** <feat/T3-01-short-slug> (base commit: <SHA>)
- **Assigned Dev/Preview Port:** <4174>

#### Objective
<2–4 sentences describing the exact deliverable and user outcome.>

#### Read-Only Context (Read ONLY these before starting)
- `AGENTS.md`
- `harness/feature-ledger.json` (entry `<Task ID>`)
- `<specific docs/brand/... or docs/design/... paths>`

#### File Ownership Contract
- **Exclusive Write Paths (`ownedPaths`):** `<glob list from feature-ledger.json>`
- **Forbidden Paths:** Everything outside `ownedPaths` (especially `src/styles/tokens.css`, `package.json`, `harness/feature-ledger.json`, and other tasks' folders).

#### Frozen Upstream Contracts
- Design tokens: `src/styles/tokens.css` (frozen at `<SHA>`)
- Content schemas: `src/content/config.ts` (frozen at `<SHA>`)

#### Acceptance Criteria (Negotiated "Done" Contract)
1. <Testable criterion 1>
2. <Testable criterion 2>
3. <Testable criterion 3>

#### Required Verification Commands
- Baseline check before edits: `npm run verify:fast`
- Pre-handoff check: `npm run verify:fast` (plus `PORT=4174 npx playwright test ...` if applicable)

#### Stop & Escalation Rules
- Max consecutive retries on the same error: **2**. On the 2nd identical failure, STOP, keep changes uncommitted/committed on branch, and return a BLOCKER report.
- Do not add new npm dependencies or modify frozen tokens/schemas; escalate to Manager instead.
```

---

## 4. Context Hygiene Rules

- **Fresh Context Per Task:** Spawn a clean subagent per task ID rather than reusing a bloated session across unrelated phases.
- **No Raw Log Dumps Back to Manager:** Subagents save verbose build/Playwright/Lighthouse logs or screenshots to files (`docs/qa/` or test artifact directories) and return only a concise **Evidence Bundle** (under 300 words) to the Manager.
- **Repository Over Chat:** Any brand decision, visual rationale, or bug finding that future agents will need must be written to a committed file (`docs/` or `harness/progress.log`), never left only in a chat message.

---

## 5. Subagent Evidence Bundle (Mandatory Handoff Format)

A subagent may NOT mark a task done with "looks good" or "tests passed" prose. Every completed task must return this exact evidence block:

```markdown
### Evidence Bundle — <Task ID>
- **Status:** READY_FOR_REVIEW | BLOCKED
- **Branch & Commit SHA:** `<branch>` @ `<7-char SHA>`
- **Files Changed:**
  - `<path/to/file1>` (added | modified)
  - `<path/to/file2>` (added | modified)
- **Ownership Check:** Confirmed all changed files are within assigned `ownedPaths` (`git diff --name-only <base>..HEAD`).
- **Verification Commands Executed:**
  1. `npm run verify:fast` -> **EXIT 0** (Stylelint: 0 errors, Typecheck: 0 errors, Build: `dist/` generated)
  2. `<additional command>` -> **EXIT 0**
- **Artifacts / Screenshots (if UI/QA):**
  - `<path/to/screenshot-375px.png>`
  - `<path/to/report.md>`
- **Open Risks / Follow-ups:** <None, or concise bullet list of items for Manager>
```

---

## 6. Integration, Whole-Branch QA & Ledger Update Protocol

When a writer subagent returns `READY_FOR_REVIEW`:
1. **Diff & Boundary Check (Manager):** Inspect `git diff --name-only <base>..HEAD` to confirm zero out-of-bounds edits and zero `stylelint-disable` / threshold-weakening hacks.
2. **Dependency-Ordered Merge (Manager):** For parallel Phase 3 branches, merge in planned order (e.g., `T3-01` → rebase `T3-02` onto updated `main` → merge `T3-02` → rebase `T3-03` → merge `T3-03`), running `npm run verify:fast` after each merge.
3. **Worktree Cleanup (Manager):** Remove merged worktrees (`git worktree remove ../wt-T3-01` and delete merged local branch).
4. **Independent Whole-Branch Verification (QA Verifier):** After a phase's writes are merged, launch the read-only **QA / Visual & Accessibility Verifier** against the integrated branch to run Tier 2 + Tier 3 checks. Per-task checks never replace whole-branch review.
5. **Ledger & Progress Commit (Manager):** Only after verification passes, the Manager updates `harness/feature-ledger.json` (`status: "done"`, `passes: true`, `evidence: { commit, verifiedBy, reportPath }`) and appends a one-paragraph entry to `harness/progress.log`.
