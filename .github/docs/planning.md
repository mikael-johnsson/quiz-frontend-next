# Feature Planning

A living document tracking planned and in-progress features.

---

## Profile Page

Personal dashboard for authenticated users to manage their profile and track their activity on the platform.

### Features

#### 1. User's Contribution Dashboard

Show stats and a list of questions the logged-in user has created.

**Functionality:**

- Total questions created count
- Number of approved vs. pending approval questions
- List of user's questions with status badges (approved/pending)
- Option to edit/delete their own questions
- Optional: themes and difficulty distribution visualization

**Why:** Users who contribute content want to see their impact and track submission status.

---

#### 2. User's Quiz Activity & History

Display personalized quiz statistics and activity tracking.

**Functionality:**

- Quizzes taken (count and dates)
- Favorite themes/difficulties based on activity
- Recent quiz results or completion metrics
- Option to save/bookmark certain quiz combinations for quick access
- Time spent on quizzes (if tracked by backend)

**Why:** Activity tracking and quick-access to favorite configurations improves user engagement and reduces friction.

---

#### 3. Profile Settings & Preferences

Basic profile management for the logged-in user.

**Functionality:**

- Display full name (firstname from auth context)
- Email address display
- Password change option
- Optional: Default quiz preferences (preferred themes/difficulties)

**Why:** Standard user account management; gives users control over their profile.

### Constraints

- Personal dashboard only (no public user profiles or social features at this stage)
- Use only `firstname` from AuthResponse (do not add lastname for now)

### Related files

- [src/app/profile/[id]/page.tsx](src/app/profile/[id]/page.tsx): Profile page component
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx): User authentication and data
- [src/models/types.tsx](src/models/types.tsx): Type definitions

---

## Implementation: Profile Settings & Preferences (Step-by-Step)

Incremental implementation of feature #3: Profile Settings & Preferences.

### Step-by-step execution with checkpoints

1. Step 1: Create profile page layout and display user info.
   Convert ProfilePage from "use client" to display basic user information (firstname, email) from useAuth hook.
   Display in a simple two-column layout: label on left, value on right.
   Checkpoint: Profile page displays firstname and email from authenticated user without errors.

2. Step 2: Create password change form component.
   Create new component [src/components/profileSettings/passwordChangeForm.tsx](src/components/profileSettings/passwordChangeForm.tsx).
   Form should have three fields: current password, new password, confirm new password.
   Make it a client component.
   Checkpoint: Form renders with three input fields and a submit button.

3. Step 3: Add form validation for password change.
   Add client-side validation:
   - Current password is required
   - New password is required and must be at least 8 characters
   - Confirm password matches new password
   - Display validation error messages below each field
     Checkpoint: Form shows appropriate error messages when user tries to submit invalid data.

4. Step 4: Extend types for password change request.
   Add new type `PasswordChangeRequest` in [src/models/types.tsx](src/models/types.tsx) with fields: currentPassword, newPassword.
   Checkpoint: Type is exported and available for use.

5. Step 5: Add password change API function.
   Add new function `changePassword` in [src/services/authService.tsx](src/services/authService.tsx) that POST to backend endpoint (e.g., `/auth/change-password`).
   Checkpoint: Function accepts PasswordChangeRequest and returns response.

6. Step 6: Implement form submission handling.
   Connect password change form submit button to call changePassword function from authService.
   Show loading state while request is in flight.
   Show success or error message to user after submission.
   Clear form fields on successful password change.
   Checkpoint: Form can submit, shows loading state, and displays success/error messages.

7. Step 7: Add password change form to profile page.
   Integrate passwordChangeForm component into the profile page layout below user info.
   Use flex layout to organize sections vertically.
   Checkpoint: Password change form appears on profile page below user info section.

8. Step 8: Create quiz preferences form component (optional).
   Create new component [src/components/profileSettings/quizPreferencesForm.tsx](src/components/profileSettings/quizPreferencesForm.tsx).
   Display multi-select dropdowns for preferred themes and difficulties.
   This is future-proofing; values may not be persisted to backend yet.
   Checkpoint: Component renders with theme and difficulty selectors.

9. Step 9: Add styling to profile page.
   Create [src/app/profile/profile.module.css](src/app/profile/profile.module.css) with:
   - Container layout (flex, max-width, centered)
   - Section spacing and borders
   - Form field styling
   - Button styling (consistent with rest of app)
     Checkpoint: Profile page looks polished and matches app styling conventions.

10. Step 10: Verify implementation.
    Manual checks:
    - Navigate to profile page while logged in
    - Verify user info displays correctly
    - Test password change form validation
    - Test successful password change (if backend is ready)
    - Verify error handling on failed password change
      Checkpoint: All manual checks pass without console errors.

### Parallelism and dependencies

1. Can run in parallel: Step 1, Step 2, and Step 4.
2. Depends on Step 2: Step 3 and Step 6.
3. Depends on Step 5 and Step 6: Step 7.
4. Can run in parallel with other steps: Step 8 (optional feature).
5. Final styling: Step 9 (can be done after Step 7 or in parallel).
6. Verification after Steps 1-9: Step 10.

### Verification checklist

1. Profile page loads without errors when user is authenticated.
2. Firstname and email display correctly from auth context.
3. Password change form validates all three fields correctly.
4. Error messages appear for each validation failure.
5. Form shows loading state during submission.
6. Success message displays after successful password change.
7. Form fields clear after successful submission.
8. Error message displays if password change fails.
9. Profile page styling is consistent with app design.
10. No console errors or TypeScript errors in the component.

## Implementation: User's Contribution Dashboard (Step-by-Step)

Incremental implementation plan for feature #1: User's Contribution Dashboard.

### Step-by-step execution with checkpoints

1. Step 1: Define requirements & data contracts.
   - Confirm backend endpoints: `GET /questions?createdBy={id}`, `DELETE /questions/{id}`, `PUT /questions/{id}` (or equivalents).
   - Confirm auth and authorization behavior for edit/delete.
   - Check `Question` and `PostQuestionRequest` types for required fields.
     Checkpoint: API surface and types documented.

2. Step 2: Add service method to fetch user's questions.
   - Add `getUserQuestions(userId: string, options?)` in [src/services/quizService.tsx](src/services/quizService.tsx).
   - Support optional pagination, approval filter, themes and difficulty.
     Checkpoint: Service returns `QuestionResponse` and handles errors.

3. Step 3: Create `ContributionsList` component (client).
   - New component at [src/components/profile/contributionsList.tsx](src/components/profile/contributionsList.tsx).
   - Fetch on mount using `getUserQuestions(user.id)` and render list with question, status badge, themes, difficulty, createdWhen.
   - Provide loading and empty states.
     Checkpoint: Component renders user's questions.

4. Step 4: Add edit/delete UI and handlers.
   - Add `Edit` button that opens the existing `questionForm` in edit mode (or a modal).
   - Add `Delete` button with confirmation; call service to delete and refresh list.
   - Ensure optimistic UI or loading states on actions.
     Checkpoint: Edit and delete actions work and refresh list.

5. Step 5: Pagination, filtering and search.
   - Add simple pagination or “Load more” for long lists.
   - Add filters for approval status, themes, difficulty, and a search input.
   - Persist filters in query params or localStorage if useful.
     Checkpoint: Users can filter and navigate lists.

6. Step 6: Add contribution statistics.
   - Display totals and approved vs pending counts in a small stats bar.
   - Optionally show theme/difficulty distribution with simple charts.
     Checkpoint: Stats reflect list state and update after edits.

7. Step 7: Styling and responsive layout.
   - Create [src/components/profile/contributionsList.module.css](src/components/profile/contributionsList.module.css) matching app style.
   - Ensure accessibility for buttons, forms and lists.
     Checkpoint: Component matches visual conventions and is responsive.

8. Step 8: Tests and verification.
   - Add unit tests for service parsing and component rendering where practical.
   - Manual checks: list loads, edit/delete flows, pagination/filters and stats update.
     Checkpoint: Tests pass and manual checks succeed.

### Parallelism and dependencies

1. Service method (Step 2) can be implemented before the UI (Step 3).
2. Edit/delete depend on service endpoints for update/delete.
3. Pagination and filters can be iterated — start with a simple Load More.

### Verification checklist

1. `ContributionsList` loads and displays the user's questions.
2. Edit and delete actions succeed and refresh the list.
3. Filters and pagination work as expected.
4. Statistics update after modifications.
5. No TypeScript or console errors present.
