# Feature Planning

A living document tracking planned and in-progress features.

---

## Add question amount to QuizForm

Short description

- Add a numeric `amount` input to the quiz creation form so users can choose how many questions to generate. The value should be propagated through the existing URL query flow and forwarded to the backend. The frontend will default to 10 (recommended), the backend default is 20, and the allowed range is 1–50.

Acceptance criteria

- The `QuizForm` UI includes a numeric `amount` input with `min=1`, `max=50` and a sensible default (10 client-side).
- Submitting the form includes `amount` in the URL query string (e.g., `?amount=5&themes=...`).
- The server-side page reads `searchParams.amount`, normalizes it (parseInt, fallback to backend default 20 if omitted), clamps to 1–50, and passes it to the `Quiz` component.
- `getQuestions()` in `quizService` accepts an `amount` and includes it in the backend request URL when present.

Files to change

- [src/components/quizForm/quizForm.tsx](src/components/quizForm/quizForm.tsx)
- [src/app/page.tsx](src/app/page.tsx)
- [src/components/quiz/quiz.tsx](src/components/quiz/quiz.tsx)
- [src/services/quizService.tsx](src/services/quizService.tsx)

Proposed API contract (query param)

- Parameter: `amount` (integer)
- Location: URL query string
- Example request: `GET /?generate=true&themes=science&amount=5`
- Validation: integer, >=1, <=50. If absent, backend uses its default (20).

Step-by-step implementation

1. Add numeric input to `QuizForm` with `name="amount"`, `type="number"`, `min=1`, `max=50`, `defaultValue=10` and inline helper text.
2. Confirm `handleSubmit` keeps `FormData` usage so `amount` is appended to `URLSearchParams` automatically.
3. Update `app/page.tsx` to parse `searchParams.amount`, `parseInt`, fallback to backend default `20` when missing, and clamp to 1–50.
4. Pass `amount` as a prop to the `Quiz` component.
5. Update `Quiz` to accept `amount` and forward it to `getQuestions()`.
6. Modify `src/services/quizService.tsx` `getQuestions()` to accept optional `amount?: number` and append `&amount=${amount}` when provided.
7. Add small unit tests to assert `amount` is forwarded from `Quiz` to `quizService` (mock service).
8. Manual verification: run the app, submit with different `amount` values, and confirm backend receives `amount` correctly; test edge values (0, 999) are clamped.

Testing / Verification

- Unit: mock `getQuestions()` and verify it is called with the parsed/clamped `amount`.
- Manual: fill form with `amount=5`, submit, inspect network/backend logs to confirm `amount=5`.
- Edge cases: no `amount`, `amount=0`, and `amount=999` — ensure normalization/clamping.

Effort estimate: small — ~1–2 hours including basic tests.

Notes / decisions

- Client-side default: 10 (recommended UX choice). Backend default remains 20; server-side parsing will use backend default when `amount` is omitted to avoid unexpected behavior.
- Allowed max: 50 (agreed). Server must also enforce this limit.

## Show three quizzes on the main page

Short description

- Add a quiz preview section to the landing page that shows the first three quizzes returned by the backend. Each card should initially show only the creator name and `amountOfSaves`. Clicking the creator name expands that quiz so the full questions are visible.

Acceptance criteria

- The main page renders a list of exactly three quizzes when quiz data is available.
- Each preview card shows only `createdBy` and `amountOfSaves` in the collapsed state.
- Clicking the creator name toggles or opens the full quiz content for that specific quiz.
- The expanded view displays all quiz questions in a readable layout.
- The interaction works with keyboard focus and is obvious to screen readers.
- If quiz data is loading or missing, the page shows a clear fallback state instead of breaking.

Files to change

- [src/app/page.tsx](src/app/page.tsx)
- [src/components/quiz/quiz.tsx](src/components/quiz/quiz.tsx)
- [src/components/quiz/quiz.module.css](src/components/quiz/quiz.module.css)
- [src/models/types.tsx](src/models/types.tsx)
- [src/services/quizService.tsx](src/services/quizService.tsx)
- [src/services/serviceBase.tsx](src/services/serviceBase.tsx) if the quiz fetch needs a new query pattern
- new quiz list component file, for example [src/components/quizList/quizList.tsx](src/components/quizList/quizList.tsx)

Proposed API contract

- Assumed endpoint: `GET /quizzes?limit=3`
- Response example:

```json
{
  "quizzes": [
    {
      "id": "quiz_123",
      "questions": [1, 2, 3],
      "createdBy": "Anna Andersson",
      "amountOfSaves": 14,
      "createdWhen": "2026-05-21T10:00:00.000Z"
    }
  ]
}
```

- Required fields for the frontend: `id`, `questions`, `createdBy`, `amountOfSaves`.
- Important backend note: the frontend needs a stable quiz identifier (`id` or slug) to open the correct quiz when the creator name is clicked. Without it, the UI cannot reliably target one quiz if a creator has more than one quiz.
- If the backend cannot return full question objects in the list response, the expanded state should call a second endpoint such as `GET /quizzes/:id` or `GET /quizzes/:id?include=questions` to fetch the question details.

Quiz save contract

- Endpoint: `POST /quiz`
- Auth: cookie-based, `quiz_login=<JWT>` must be sent with the request
- Body: none
- Trigger: the user has generated a quiz and clicks the heart icon to save it
- Backend expectation: the server should persist the generated quiz using the quiz data already present in the current UI state or session context; the frontend does not send a request body for this action
- Frontend note: the heart icon and save interaction do not exist yet, so the implementation should introduce both the UI control and the save action together

Step-by-step implementation

1. Update the quiz types in `src/models/types.tsx` so the app has a clear preview type and a full quiz type with a stable `id`.
2. Add a backend fetch function in `src/services/quizService.tsx` for loading the three quiz previews, and another fetch path for loading one quiz in full when it is expanded.
3. Create a dedicated quiz list component for the landing page so `page.tsx` stays simple and only decides when to show the section.
4. Build the collapsed card state so it renders only the creator name and save count.
5. Make the creator name interactive with a button or link that expands the selected quiz and loads or reveals the question list.
6. Render the expanded quiz questions in a nested section with clear spacing and labels.
7. Update the CSS module for the new component and the quiz display states so the collapsed and expanded views are visually distinct.
8. Add a small loading and empty state so the page still feels stable when the quiz list is not available.
9. Add tests for the preview rendering and the expand action, or at minimum add a manual verification checklist if the repo does not yet have component tests for this area.
10. Add the save interaction for generated quizzes so the heart icon calls `POST /quiz` with cookie auth and no request body.

Testing / Verification

- Manual: open the main page and confirm only three quizzes render.
- Manual: verify the collapsed state shows only creator name and `amountOfSaves`.
- Manual: click the creator name and confirm the matching quiz expands and all questions appear.
- Manual: use keyboard navigation to focus and activate the creator control.
- If tests are available, add a component test that checks the collapsed and expanded states for a quiz card.

Suggested reviewers

- Whoever owns the quiz backend contract, because the API must expose a stable quiz identifier and the full-question fetch shape.
- A frontend reviewer familiar with the landing page layout and the existing server-component data flow.

Effort estimate: medium — about 3–5 hours, depending on whether the backend already exposes a quiz detail endpoint.

---

## Sync saved quizzes after save/unsave

Short description

- Ensure the frontend's `user.savedQuizzes` state stays in sync with backend saved/unsaved actions so UI elements (badges, save button text) reflect the true server state immediately after the user acts.

Problem

- Currently the auth payload cached in the cookie (or backend session) can be stale after a save/unsave operation, causing the UI to show incorrect saved state until the session is refreshed.

Options

- Option A — Client-side refresh (recommended short-term):
  - After a successful `save` or `unsave` request, call the existing `refreshMe()` from the `AuthContext` to re-fetch the current user and update `user.savedQuizzes`.
  - Pros: No backend work required; simple to implement; ensures the client mirrors server state.
  - Cons: One additional network request on each save/unsave action.

- Option B — Server-side immediate cookie/payload update (recommended long-term):
  - Ensure the backend updates the auth cookie/session payload when the user saves or unsaves a quiz, so subsequent `GET /me` calls (or server-rendered pages) immediately reflect the new saved state.
  - Pros: Single source of truth on server; no extra client requests; consistent for server-side rendering.
  - Cons: Requires backend changes and careful handling of cookie payload size and security.

Proposed implementation (practical path)

1. Implement Option A first (client-side `refreshMe()`):
   - Call `await refreshMe()` after `setUser(...)` in save/unsave handlers so the client immediately re-syncs with the server.
   - Add minimal loading indicator or optimistic UI for `amountOfSaves` to keep UX smooth while `refreshMe()` runs.
2. Parallel or later: request backend change to update auth cookie/payload on save/unsave (Option B) to remove the extra round-trip.

Files to change

- `src/components/quizList/components/quizPreviewCard/quizPreviewCard.tsx` — call `refreshMe()` after `setUser` in `handleSave()`.
- `src/contexts/AuthContext.tsx` — verify `refreshMe()` is exported and performs a fresh `getMe()` call (no change expected if already implemented).
- Optional: small UI tweak in `quizPreviewCard` to optimistically update `amountOfSaves` while `refreshMe()` is pending.

Acceptance criteria

- After saving or unsaving a quiz, the UI immediately shows the correct `SAVED` badge and button text for that quiz.
- `GET /me` remains the canonical source of truth; `refreshMe()` updates local `user` accordingly.

Effort estimate: small — ~30–60 minutes to implement client-side refresh and basic optimistic UI.
