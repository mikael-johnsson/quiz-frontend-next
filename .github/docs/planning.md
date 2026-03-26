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
