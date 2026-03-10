# Feature Planning

A living document tracking planned and in-progress features.

---

## Auth Page — Login & Sign Up

**Status:** Planned

**Goal:** Add a `/auth` page with two form cards side by side — `LoginForm` (email + password) and `SignUpForm` (email + password + first/last name). Services are mocked until a real backend is in place. Inline success/error feedback. Redirect to `/` on success.

---

### Phase 1 — Types & Service Layer

**Step 1** — Add auth types to `src/models/types.tsx`

- `LoginRequest { email: string; password: string }`
- `SignUpRequest { email: string; password: string; firstName: string; lastName: string }`
- `AuthResponse { token: string; user: { id: number; email: string; firstName: string; lastName: string } }`

**Step 2** — Add `postData` to `src/services/serviceBase.tsx`

- A `fetch()` wrapper with `method: "POST"` and `Content-Type: application/json`
- Follows the same pattern as the existing `getData`

**Step 3** — Create `src/services/authService.tsx` _(new file)_

- `login(data: LoginRequest): Promise<AuthResponse>` — calls `postData` (mocked for now)
- `signUp(data: SignUpRequest): Promise<AuthResponse>` — calls `postData` (mocked for now)

---

### Phase 2 — Components

**Step 4** — Create `src/components/loginForm/loginForm.tsx` + `loginForm.module.css` _(new)_

- `"use client"` — needs `useState` and `useRouter`
- Controlled inputs for email + password
- On submit: call `login()`, show inline success/error below the button, redirect to `/` on success
- Card-style design: white bg, dark text, rounded corners, subtle shadow (mirrors `landingAside`)

**Step 5** — Create `src/components/signUpForm/signUpForm.tsx` + `signUpForm.module.css` _(new)_

- Same pattern and visual design as `LoginForm`
- Adds `firstName` + `lastName` fields
- Calls `signUp()` from `authService`

---

### Phase 3 — Page & Navigation

**Step 6** — Create `src/app/auth/page.tsx` + `page.module.css` _(new)_

- Server component — renders the two form components side by side
- `flex` row layout with `flex-wrap` so it stacks on mobile

**Step 7** — Update the header link in `src/components/header/header.tsx`

- Change the `href` for "LOGGA IN / REGISTRERA DIG" from `"/"` to `"/auth"`

---

### Files Affected

| File                                              | Action                 |
| ------------------------------------------------- | ---------------------- |
| `src/models/types.tsx`                            | Edit — add auth types  |
| `src/services/serviceBase.tsx`                    | Edit — add `postData`  |
| `src/services/authService.tsx`                    | New                    |
| `src/components/loginForm/loginForm.tsx`          | New                    |
| `src/components/loginForm/loginForm.module.css`   | New                    |
| `src/components/signUpForm/signUpForm.tsx`        | New                    |
| `src/components/signUpForm/signUpForm.module.css` | New                    |
| `src/app/auth/page.tsx`                           | New                    |
| `src/app/auth/page.module.css`                    | New                    |
| `src/components/header/header.tsx`                | Edit — update nav link |

---

### Acceptance Criteria

1. Navigate to `/auth` — both form cards render side by side on desktop and stack on mobile
2. Submit the login form — inline success message appears, then page redirects to `/`
3. Submit the sign-up form — same flow
4. Submit with empty fields — browser native `required` validation blocks submission
5. Header "LOGGA IN / REGISTRERA DIG" link navigates to `/auth`

---

### Design Decisions

- **Mocked services** return a hard-coded success response — trivial to replace with a real URL later
- **`flex` layout** used throughout (project rule: flex for 1-row/column, grid for 2+)
- **Separate CSS modules** per component — they share a visual style but differ in fields, so DRY doesn't apply at the CSS level
- **Inline feedback** (error/success message below the submit button) rather than a toast
