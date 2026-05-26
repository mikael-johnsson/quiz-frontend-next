# Feature Planning

A living document tracking planned and in-progress features.

---

## Add a dedicated quiz route

Short description

- Give each saved quiz its own route based on `_id`, and render a full quiz view that matches the current `QuizPreviewCard` layout but stays open by default. The route should also include a PDF download button that reuses the same download flow used in `QuizActions`.

Acceptance criteria

- Visiting the new quiz route with a valid quiz `_id` loads that quiz and shows its creator, save count, and question list without requiring a click to expand.
- The route renders a view that looks and feels like `QuizPreviewCard`, but it is always expanded.
- The page includes a PDF download button that uses the same request-building logic as the existing generated-quiz download action.
- Invalid or missing quiz ids show a clear empty/error state instead of a broken page.
- The implementation reuses the existing quiz service and avoids duplicating PDF query-string logic.

Files to change

- [src/app/quiz/[id]/page.tsx](src/app/quiz/[id]/page.tsx) - new route page that loads one quiz by `_id` and renders the detail view.
- [src/components/quizList/components/quizPreviewCard/quizPreviewCard.tsx](src/components/quizList/components/quizPreviewCard/quizPreviewCard.tsx) - extract or extend the card so it can render in forced-open mode.
- [src/components/quiz/quizActions.tsx](src/components/quiz/quizActions.tsx) - reuse or extract the PDF link-building logic so the new route gets the same download behavior.
- [src/services/quizService.tsx](src/services/quizService.tsx) - keep `getSavedQuiz` as the route data source and add any small helper needed for the PDF download URL.
- [src/models/types.tsx](src/models/types.tsx) - tighten quiz detail types if the route needs a clearer distinction between preview and full quiz data.
- [src/app/api/quiz/pdf/route.ts](src/app/api/quiz/pdf/route.ts) - only if the PDF endpoint needs to accept quiz ids directly instead of reconstructed question ids.

Proposed API contract

- Route page: `GET /quiz/[id]`
- Data source: `GET /quiz/:id` via `getSavedQuiz(id)`
- PDF download options:
  - Preferred: keep using `GET /api/quiz/pdf` with `questionIds`, `themes`, and `difficulties` query params built from the loaded quiz data.
  - If the backend cannot reconstruct a PDF from those values reliably, add a backend-supported quiz-id contract such as `GET /api/quiz/pdf?quizId=:id` or `GET /quiz/:id/pdf`.
- Example page behavior:
  - Load quiz by `_id`
  - Render creator name, save count, and all questions in expanded state
  - Build the PDF link from the currently loaded quiz data

Step-by-step implementation

1. Add a new dynamic route at `src/app/quiz/[id]/page.tsx` that reads the route param, calls `getSavedQuiz`, and handles loading and error states.
2. Split the current preview card into a shared render path so the existing list card and the route page can use the same quiz content markup.
3. Add a prop such as `forceExpanded` or `defaultExpanded` so the detail route can show the questions immediately while the list card keeps its current toggle behavior.
4. Reuse the same PDF URL-building logic from `QuizActions` so the new route can download a PDF without duplicating query-string construction.
5. Decide whether the new route should keep using the existing `/api/quiz/pdf` query contract or whether the backend needs a quiz-id-based PDF endpoint, then wire the route to that contract.
6. Add a friendly empty state for missing quizzes and a clear message for invalid ids or fetch failures.
7. Verify that the landing page quiz list still uses the collapsed preview card and that the new route does not change that behavior.

Testing / verification

1. Open a valid quiz route directly in the browser and confirm the quiz content renders open by default.
2. Click the PDF download button and confirm the downloaded file matches the loaded quiz.
3. Open the route with a bad `_id` and confirm the error state is readable.
4. Confirm the landing page quiz previews still collapse and expand exactly as before.
5. Run a targeted type check or lint check on the touched route, component, and service files.

Suggested reviewers

- Whoever owns the quiz backend contract, because the route depends on the existing `GET /quiz/:id` response and may need a quiz-id PDF contract.
- A frontend reviewer familiar with the quiz preview card and the existing PDF download flow.

Effort estimate: medium - roughly 3 to 5 hours depending on whether the PDF button can reuse the existing query-param flow unchanged.

## Refactor quiz list for profile page

Short description

- Refactor the quiz preview flow so `QuizList` and `QuizPreviewCard` can be reused on the profile page to show only quizzes created by the logged-in user, while keeping the landing page quiz list unchanged.

Acceptance criteria

- The landing page still shows the public quiz preview list as it does today.
- The profile page renders a quiz list for the logged-in user only.
- The profile list heading is renamed to something like "Mina quiz".
- The backend accepts `amount` and `createdBy` query parameters when loading quiz previews.
- `getQuizPreviews` can fetch both the default landing-page list and filtered profile lists through a typed options object.
- The quiz preview card still works for the same quiz preview data shape on both pages.
- Empty states remain clear when the user has no created quizzes.

Files to change

- [src/services/quizService.tsx](src/services/quizService.tsx) - update `getQuizPreviews` to accept optional filters such as `amount` and `createdBy`.
- [src/components/quizList/quizList.tsx](src/components/quizList/quizList.tsx) - make the list reusable for both landing and profile contexts.
- [src/components/quizList/components/quizPreviewCard/quizPreviewCard.tsx](src/components/quizList/components/quizPreviewCard/quizPreviewCard.tsx) - keep the card focused on preview rendering and shared interaction.
- [src/app/page.tsx](src/app/page.tsx) - keep the landing page using the default quiz list behavior.
- [src/app/profile/[id]/page.tsx](src/app/profile/[id]/page.tsx) - pass the logged-in user's id into the quiz list.
- [src/models/types.tsx](src/models/types.tsx) - adjust preview types if the service contract needs clearer filter support.

Proposed API contract

- Route: `GET /quiz`
- Auth: cookie-based, credentials included
- Existing query param: `populate=true`
- New query params:
  - `amount` - number of quiz previews to return
  - `createdBy` - user id to filter previews by creator
- Example requests:
  - Landing page: `{ "url": "/quiz?populate=true&amount=3" }`
  - Profile page: `{ "url": "/quiz?populate=true&createdBy=user-123" }`
  - Profile page with cap: `{ "url": "/quiz?populate=true&createdBy=user-123&amount=6" }`
- The endpoint should keep returning the same quiz preview shape that `QuizPreviewCard` already expects.

Step-by-step implementation

1. Update `getQuizPreviews` in `src/services/quizService.tsx` so it accepts an options object with `amount?` and `createdBy?`.
2. Build the query string safely with `URLSearchParams` so landing-page and profile-page requests share the same code path.
3. Refactor `QuizList` so it accepts props for title and quiz filters instead of hardcoding only the landing-page list.
4. Update `QuizPreviewCard` only if it currently depends on landing-page-specific assumptions.
5. Keep `src/app/page.tsx` on the default quiz list behavior.
6. Pass the authenticated user's id from `src/app/profile/[id]/page.tsx` into `QuizList` so the profile page shows only their quizzes.
7. Add or adjust empty-state text so the profile page explains when the user has not created any quizzes yet.
8. Run targeted validation and confirm both pages still render correctly.

Testing / verification

1. Confirm the landing page still shows the global quiz preview list.
2. Confirm the profile page shows only quizzes created by the logged-in user.
3. Confirm the profile list heading is profile-specific.
4. Confirm the empty state is shown when the backend returns no quizzes for the user.
5. Run a targeted type or lint check on the touched files.

Suggested reviewers

- Whoever owns the quiz backend contract, because the new `createdBy` and `amount` query params must be supported server-side.
- A frontend reviewer familiar with the landing page and profile page layout.

Effort estimate: medium - roughly 3 to 5 hours depending on how much shared state or prop plumbing the list refactor needs.

## Add generated quiz save button

Short description

- Add a save button to `QuizActions` so a logged-in user can persist the currently generated quiz, and update `saveGeneratedQuiz` to send the generated quiz question ids plus the current user id in the request body. The backend contract now returns a structured JSON response, so the frontend should parse it, update auth state, and show success or error feedback in the quiz action area.

Acceptance criteria

- `QuizActions` shows a save button for the generated quiz view.
- Clicking the button sends a `POST` request to `NEXT_PUBLIC_BASE_URL + "/quiz"` with JSON body `{ questions: string[], createdBy: string }`.
- `questions` contains the generated quiz question ids converted to strings.
- `createdBy` uses the logged-in user id from auth state.
- The frontend handles the backend success response shape `{ status, message, quiz, user }`.
- On success, the UI updates the current auth user from the returned `user` object and shows a confirmation state/message.
- On failure, the UI shows a clear error state and does not silently fail.
- The existing PDF download and clear quiz actions keep working.

Files to change

- [src/components/quiz/quizActions.tsx](src/components/quiz/quizActions.tsx) - add the save button, wire the click handler, and manage loading/error/success UI.
- [src/services/quizService.tsx](src/services/quizService.tsx) - change `saveGeneratedQuiz` to accept a request body and parse the JSON response.
- [src/models/types.tsx](src/models/types.tsx) - add request/response types for the generated quiz save flow, if needed.
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - only if the returned `user` payload needs a broader type than the current auth model.
- [src/services/utils/httpHelpers.ts](src/services/utils/httpHelpers.ts) - only if the save helper should reuse the shared `postData` helper instead of inline `fetch`.

Proposed API contract

- Route: `POST /quiz`
- Base URL: `NEXT_PUBLIC_BASE_URL`
- Request body:
  - `questions: string[]` - stringified ids of the generated quiz questions.
  - `createdBy: string` - authenticated user id.
- Recommended request example:
  - `{ "questions": ["12", "18", "24"], "createdBy": "user-123" }`
- Success response example:
  - `{ "status": 201, "message": "Quiz saved", "quiz": { ...SavedQuiz }, "user": { ...AuthResponse } }`
- Notes:
  - The frontend should treat `message` as the user-facing success text where appropriate.
  - The returned `user` shape matches `AuthResponse`, so the frontend can reuse the existing auth model.

Step-by-step implementation

1. Update `saveGeneratedQuiz` in `quizService.tsx` to accept a typed request object and `POST` JSON to `/quiz` with `credentials: "include"`.
2. Add request/response types in `models/types.tsx` so the body and returned payload are explicit and easy for a junior developer to follow.
3. In `quizActions.tsx`, derive the generated quiz question ids from `questions`, convert them to strings, and add a save button that calls the service.
4. Add auth-aware guard logic in `quizActions.tsx` so the button only works for logged-in users and shows a clear message if the user is not authenticated.
5. Add loading state, success message, and error message handling in `quizActions.tsx` so the save action gives visible feedback.
6. Update auth state from the returned `user` payload after a successful save, so the UI stays in sync with the backend.
7. Run targeted validation on the touched files, then manually verify the network request payload in the browser.

Testing / verification

1. Run a targeted type check or the repo’s usual validation command for the touched files after the code change.
2. In the browser, generate a quiz, click the save button, and confirm the request body contains string question ids plus the logged-in user id.
3. Confirm the UI shows a success state and the authenticated user data updates from the response.
4. Confirm an unauthenticated user cannot submit the save request and sees the intended message instead.
5. Confirm the existing PDF download and clear quiz actions still work.

Suggested reviewers

- Whoever owns the quiz backend contract, because the API must expose the request body and response shape described above.
- A frontend reviewer familiar with the quiz action area and the existing auth state flow.

Effort estimate: small to medium - mostly a service contract update plus one client component wiring change.

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
