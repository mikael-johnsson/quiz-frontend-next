# Feature Planning

A living document tracking planned and in-progress features.

---

## Login/Sign Up

Goal: Create separate login and signup pages with similar styling and required fields.

### Scope

- Create two dedicated routes: `/login` and `/signup`
- Keep Swedish labels/messages
- Add cross-links between pages
- Login fields: email and password (required)
- Signup fields: first name, last name, email, password, confirm password (all required)

### Implementation Plan

#### Phase 1: Route pages and layout consistency

1. Update `src/app/login/page.tsx` to render a full login page shell with `LoginForm`.
2. Create `src/app/signup/page.tsx` to render a matching page shell with `SignUpForm`.
3. Add consistent page-level styling so both pages share spacing, max width, and card placement.
4. Add cross-links:
   - Login page links to `/signup`
   - Signup page links to `/login`

#### Phase 2: Form requirements and validation

1. Keep login requirements in `src/components/loginForm/loginForm.tsx` as email + password.
2. Extend `src/components/signUpForm/signUpForm.tsx` with `confirmPassword` state and input.
3. Add submit validation in signup form:
   - Required fields present
   - Password and confirm password must match
   - Stop submission and show inline error if validation fails
4. Update `src/components/signUpForm/signUpForm.module.css` for the additional field if needed.

#### Phase 3: Type safety and cleanup

1. Keep `confirmPassword` as local form validation only unless backend contract requires it.
2. Verify `src/models/types.tsx` remains aligned with API payload/response types.
3. Keep `src/app/auth/page.tsx` unchanged unless we explicitly decide to remove or redirect it.
4. Add concise comments/docstrings where validation logic may be unclear.

### Verification Checklist

1. `/login` shows only login form and link to signup.
2. `/signup` shows only signup form and link to login.
3. Login blocks empty required fields and submits when both fields are valid.
4. Signup blocks missing fields and mismatched passwords before service call.
5. Both pages have similar visual styling on desktop and mobile.
6. Lint/type checks pass.

### Progress Status

Current status: Implementation complete.

Completed:

- Phase 1, Step 1: Dedicated login route page implemented in `src/app/login/page.tsx`.
- Phase 1, Step 2: Dedicated signup route page implemented in `src/app/signup/page.tsx`.
- Phase 1, Step 3: Shared page-level layout styles added and card width reduced.
- Phase 1, Step 4: Cross-links added between `/login` and `/signup`.
- Phase 2, Step 1: Login remains email + password only.
- Phase 2, Step 2: `confirmPassword` state and input added to signup form.
- Phase 2, Step 3: Signup submit validation added for required fields and password match.
- Phase 2, Step 4: Small responsive style update added for signup name row on narrow screens.
- Phase 3, Step 1: `confirmPassword` kept local-only (not sent in API payload).
- Phase 3, Step 2: Signup payload made explicit with `SignUpRequest` typing.
- Phase 3, Step 3: Existing `/auth` page kept unchanged.
- Phase 3, Step 4: Validation comments/docstrings clarified in signup flow.
- Scope alignment: Remaining auth UI copy updated to Swedish for login/signup consistency.

Verification result:

- `npm run lint` completed with warnings only (no errors).
- Current warnings are unrelated to auth work and exist in `src/components/header/header.tsx` (unused `Link` and unused `navClassName`).

### Out of Scope (for this plan)

- Backend auth integration changes
- Token/session persistence strategy
- Route protection/middleware
- Removing existing `/auth` route

---

## Remove mockup login/signup

Goal: Replace mocked auth service responses with real backend endpoint calls while keeping existing login/signup UX.

### Scope

- Use hardcoded endpoints for this iteration
- Login endpoint: `https://quiz-backend-one-alpha.vercel.app/login`
- Signup endpoint: `https://quiz-backend-one-alpha.vercel.app/users`
- Keep expected success shape as `token + user`
- Keep current form behavior and redirects unchanged

### Implementation Plan

#### Phase 1: Service integration

1. Update `src/services/authService.tsx` to remove mock return blocks.
2. Add endpoint constants for login and signup URLs.
3. Implement real login request using `postData`.
4. Implement real signup request using `postData`.
5. Keep `src/models/types.tsx` unchanged unless runtime shape mismatch appears.

#### Phase 2: Error handling hardening

1. Add a small helper in `src/services/authService.tsx` to parse error responses:
   - Try JSON message first
   - Fallback to text
   - Fallback to generic message
2. Map common HTTP statuses to clear user messages (400/401/409/500).
3. Keep thrown values as plain `Error` so existing form catch blocks continue to work.

#### Phase 3: Verification and documentation

1. Verify login success and invalid credentials behavior on `/login`.
2. Verify signup success and duplicate email behavior on `/signup`.
3. Verify network failure fallback message.
4. Run `npm run lint` and confirm no new auth-related errors.
5. Update this planning document with endpoint integration progress.

### Verification Checklist

1. Login calls `POST /login` with email and password.
2. Signup calls `POST /users` with first name, last name, email, and password.
3. Failed requests show readable error messages in the UI.
4. Successful login/signup still show success feedback and redirect.
5. No new lint or type errors are introduced.

### Out of Scope (for this plan)

- Token persistence strategy changes
- Route protection/middleware
- Converting endpoint constants to environment variables (can be done in a later step)

---

## Auth Evolution (Context + /me + Header Logout)

Goal: Evolve auth into a shared, app-wide state model so most components can check login status without duplicating logic, and add a reliable logout action in the header.

### Decisions

- Use React Context now for global auth state (`user`, `isLoading`, `isAuthenticated`)
- Use backend `POST /logout` for sign-out
- Use backend `/me` to hydrate auth state from cookie
- Keep this iteration as UI-state only (no route redirect guards yet)

### Scope

- Introduce a centralized auth provider + hook
- Make header auth-aware with a logout button
- Wire login/signup flows into shared auth state
- Keep cookie-based auth (`quiz_login`) and `credentials: "include"`

### Implementation Plan

#### Phase 1: Stabilize auth configuration

1. Remove manual dotenv usage from runtime app code and rely on Next env loading.
2. Ensure auth-related client env vars use `NEXT_PUBLIC_` prefix.
3. Verify all auth requests use HTTPS and `credentials: "include"`.

#### Phase 2: Define auth service surface

1. Centralize auth-specific functions in `src/services/authService.tsx`:
   - `login`
   - `signUp`
   - `getMe`
   - `logout`
2. Keep `src/services/serviceBase.tsx` focused on generic transport helpers.
3. Standardize error handling for `401` and network failures.

#### Phase 3: Add global auth context

1. Create `src/contexts/AuthContext.tsx` with:
   - `user`
   - `isLoading`
   - `isAuthenticated`
   - `refreshMe`
   - `setUser` or equivalent login update action
   - `logoutAction`
2. On provider mount, call `/me` once to hydrate user state from cookie.
3. Keep `/me` checking centralized in context instead of calling it in each component.

#### Phase 4: Integrate provider at app root

1. Wrap app shell in provider via `src/app/layout.tsx`.
2. Ensure pages that do not need auth logic remain simple.

#### Phase 5: Wire login/signup to shared state

1. After successful login, update context immediately (or call `refreshMe`).
2. Keep signup redirect flow unchanged unless backend later supports auto-login.
3. Improve loading/error UX where needed.

#### Phase 6: Add logout button in header

1. Update `src/components/header/header.tsx` to consume auth context.
2. Logged-out UI: show login/signup actions.
3. Logged-in UI: show user indicator + `Logout` button.
4. Logout button calls `POST /logout`, clears context state, and updates header immediately.

#### Phase 7: Cross-component auth usage

1. Components needing only auth status use `isAuthenticated`.
2. Components needing profile details use `user`.
3. Avoid component-level duplicate `/me` fetches.

#### Phase 8: Verification and resilience

1. Validate initial load with existing cookie hydrates state via `/me`.
2. Validate login updates header without full reload.
3. Validate logout clears state and updates UI instantly.
4. Validate expired session (`401` from `/me`) gracefully falls back to logged-out state.
5. Run `npm run lint`.

### Verification Checklist

1. Login works and header reflects authenticated state.
2. Page refresh keeps auth state correct via `/me`.
3. Logout clears authenticated state in UI.
4. Components can read auth status from one shared source.
5. No new lint/type errors are introduced.

### Progress Status

Completed:

- Phase 1: Step 1-3 completed.
  - Manual dotenv runtime usage removed.
  - Client auth env naming aligned with `NEXT_PUBLIC_` usage.
  - Auth endpoint configuration hardened with explicit HTTPS validation.
- Phase 2: Step 1-3 completed.
  - `login`, `signUp`, `getMe`, and `logout` are centralized in `src/services/authService.tsx`.
  - `src/services/serviceBase.tsx` remains transport-focused.
  - Auth error handling is standardized.
- Phase 3: Step 1-3 completed.
  - `src/contexts/AuthContext.tsx` added with `user`, `isLoading`, `isAuthenticated`, `refreshMe`, `loginAction`, `logoutAction`, and `setUser`.
  - Provider hydrates auth state from `/me` on mount.
- Phase 4: Step 1 completed.
  - Root layout now wraps app content in `AuthProvider`.
- Phase 5: Step 1-2 completed.
  - Login form uses context `loginAction`.
  - Signup keeps current redirect behavior.
- Phase 6: Step 1-4 completed.
  - Header now shows login/signup when logged out.
  - Header shows username + logout button when logged in.
  - Logout uses context action and clears UI state.
- Phase 7: Step 1-3 in progress.
  - `QuizForm` now consumes auth context and gates quiz generation UI.
  - Login/signup forms now show an "already logged in" message when authenticated.
- Phase 8: Step 5 completed.
  - `npm run lint` runs with no errors (one existing warning intentionally kept in header).
- Build verification completed.
  - `npm run build` succeeds and app routes compile correctly (`/`, `/login`, `/signup`, `/api/quiz/pdf`).

Remaining:

- Phase 8: Step 1-4 manual runtime validation in browser (cookie hydration on refresh, logout behavior, expired session fallback).

### Out of Scope (for this plan)

- Middleware/route-guard redirects
- Full server-side route protection
- Replacing cookie auth strategy

---

## Not Approved Questions Feed

Goal: Add an unapproved questions feed on the home page for authenticated users only, with a temporary Approve action.

### Scope

- Show feed only when the user is logged in
- Render each unapproved item with question and answer
- Add an Approve button per question
- For now, Approve should only log to console
- After Approve, remove the question from the local list to simulate approval
- Keep this scope limited to the home page in this iteration

### Implementation Plan

#### Phase 1: Feed component MVP (client-side)

1. Update `src/components/notApprovedFeed/notApprovedFeed.tsx` to a client component.
2. Fetch unapproved questions via existing `getQuestions([], [], process.env.NEXT_PUBLIC_BASE_URL || "", false)` in client lifecycle.
3. Add local state for loading, error, and fetched questions.
4. Render each question with question text, answer text, and an Approve button.
5. Keep empty-state messaging when no questions are waiting for approval.

#### Phase 2: Temporary approve action

1. Add an approve handler that accepts question id (and optionally question text).
2. Log approval intent with `console.log` as placeholder for future API call.
3. Remove approved question from local state immediately after log.
4. Ensure empty-state text appears when all items are approved locally.

#### Phase 3: Auth-gated visibility on home page

1. Update `src/app/page.tsx` to render `NotApprovedFeed` only when authenticated.
2. Reuse existing auth pattern with `isLoading` and `isAuthenticated` from `AuthContext`.
3. Do not render feed during auth-loading state.

#### Phase 4: Validation and documentation

1. Validate logged-out state: feed should not render.
2. Validate logged-in state: feed should render with question, answer, and button.
3. Validate Approve click: console output appears and item disappears.
4. Run lint/type checks and verify no new issues from this feature.

### Verification Checklist

1. Logged-out users do not see the feed on `/`.
2. Logged-in users see only unapproved questions.
3. Each entry shows question, answer, and Approve button.
4. Approve click logs expected payload in console.
5. Approved item is removed from the visible list.
6. Empty-state message appears when list is empty.
7. No new lint/type errors are introduced.

### Decisions

- Visibility scope: home page only (for now)
- Technical approach: quick client component implementation
- Temporary action: `console.log` + local state removal

### Progress Status

Completed:

- Phase 1: Step 1-5 completed in `src/components/notApprovedFeed/notApprovedFeed.tsx`.
  - Converted feed to client component.
  - Moved fetch into client lifecycle using existing `getQuestions(..., false)`.
  - Added loading and error state.
  - Added Approve button per question.
  - Empty-state now follows actual rendered list length.
- Phase 2: Step 1-4 completed in `src/components/notApprovedFeed/notApprovedFeed.tsx`.
  - Added approve handler with `questionId` and `questionText`.
  - Added temporary `console.log` payload.
  - Added local state removal after approve.
  - Empty-state appears when all questions are removed.
- Phase 3: Step 1-3 completed.
  - Added auth gate component in `src/components/notApprovedFeed/notApprovedFeedGate.tsx`.
  - Home page now renders gated feed via `src/app/page.tsx`.
  - Feed is hidden while auth state is loading.
- Phase 4: Step 1-4 completed.
  - Logged-out gate path verified.
  - Logged-in render path (question, answer, Approve) verified.
  - Approve log + local removal flow verified in code.
  - Lint and TypeScript checks pass.

Verification result:

- `npm run lint` runs with no errors.
- `npx tsc --noEmit` runs successfully with no errors.
- Feature files for this implementation have no reported file-level errors.

Remaining:

- Optional browser runtime pass to manually click Approve and verify console output and UI updates end-to-end.

### Out of Scope (for this plan)

- Real backend approve endpoint integration
- Server-side authorization guards for feed reuse in other routes
- Optimistic update rollback logic based on API responses
