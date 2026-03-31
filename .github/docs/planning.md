# Feature Planning

A living document tracking planned and in-progress features.

---

## Plan: Quiz/PDF Consistency (Step-by-Step)

This is an incremental frontend-first plan that keeps the current GET contract, adds question-ID snapshot support, and preserves safe fallback behavior.

### Step-by-step execution with checkpoints

1. Step 1: Add snapshot type in [src/models/types.tsx](src/models/types.tsx).
   Define QuizSnapshot with fields: version, createdAt, questionIds, themes, difficulties.
   Checkpoint: Type compiles and is exported.

2. Step 2: Add storage utilities in [src/lib/utils.tsx](src/lib/utils.tsx).
   Implement saveQuizSnapshot, readQuizSnapshot, clearQuizSnapshot, and isSnapshotFresh (TTL-based).
   Checkpoint: Utility functions handle malformed JSON and unavailable storage without crashing.

3. Step 3: Add client action wrapper for quiz actions.
   Create a small client component (for example QuizActions) under [src/components/quiz](src/components/quiz) that receives questions, themes, and difficulties.
   Checkpoint: Existing UI still renders Rensa quiz and Ladda ner PDF.

4. Step 4: Persist rendered snapshot from the client wrapper.
   On mount/update, save the exact rendered question IDs and filters to storage.
   Checkpoint: After generating a quiz, snapshot in storage matches the visible questions.

5. Step 5: Clear snapshot on reset flow.
   When user clicks Rensa quiz, clear snapshot before navigation.
   Checkpoint: Storage key is removed when quiz is cleared.

6. Step 6: Build forward-compatible PDF query.
   Generate PDF URL with repeated questionIds plus existing themes and difficulties.
   Checkpoint: Browser network request includes questionIds in query string.

7. Step 7: Extend route parsing in [src/app/api/quiz/pdf/route.ts](src/app/api/quiz/pdf/route.ts).
   Parse optional repeated questionIds, validate as positive integers, and keep current behavior when missing.
   Checkpoint: Route handles both old and new query formats.

8. Step 8: Extend service call shape in [src/services/quizService.tsx](src/services/quizService.tsx).
   Allow optional questionIds argument for PDF requests and forward params consistently.
   Checkpoint: No regression for existing callers that pass only filters.

9. Step 9: Add user-facing fallback behavior.
   If snapshot is missing or stale, keep download enabled but show a brief warning that fallback filter-based PDF is used.
   Checkpoint: User receives predictable behavior instead of silent mismatch risk.

10. Step 10: Verify with manual and automated checks.
    Manual checks: generate -> inspect storage -> download -> clear.
    Add unit tests for storage parse/TTL and route parsing where test setup already exists.
    Checkpoint: All relevant tests pass, and manual checks confirm expected flow.

11. Step 11: Document current limitation and next step.
    Document that exact parity requires backend support for honoring questionIds during PDF generation.
    Checkpoint: Limitation and next backend task are explicitly recorded.

### Parallelism and dependencies

1. Can run in parallel: Step 1 and Step 2.
2. Depends on Step 2: Step 4 and Step 5.
3. Depends on Step 3: Step 4, Step 5, Step 6.
4. Depends on Step 6: Step 7 and Step 8.
5. Final validation after Steps 1-9: Step 10 and Step 11.

### Relevant files

- [src/components/quiz/quiz.tsx](src/components/quiz/quiz.tsx): keep server fetch/render and delegate interactive actions to a client wrapper.
- [src/components/quiz](src/components/quiz): add new client action component.
- [src/app/api/quiz/pdf/route.ts](src/app/api/quiz/pdf/route.ts): parse optional questionIds with fallback.
- [src/services/quizService.tsx](src/services/quizService.tsx): extend getPdf input shape and forwarding logic.
- [src/models/types.tsx](src/models/types.tsx): snapshot type definition.
- [src/lib/utils.tsx](src/lib/utils.tsx): safe storage and TTL utilities.

### Verification checklist

1. Generate quiz and confirm stored questionIds equal visible IDs.
2. Download PDF and verify request query contains questionIds and filters.
3. Clear quiz and confirm snapshot removal.
4. Simulate stale snapshot and verify warning plus fallback.
5. Confirm route behaves identically when questionIds are omitted.

### Scope boundaries

- Included: frontend snapshot, query extension, fallback behavior, and parsing support in local API route.
- Excluded: upstream backend contract change to POST body/full question payload.
- Known limitation: parity is not guaranteed until upstream PDF backend uses provided IDs.
