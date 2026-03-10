# How Quiz-a-nator NEXT Works

A guide for junior developers explaining how this application is structured and how the key features work.

---

## Framework

This project is built with **Next.js 16** (App Router) and **React 19**, written in **TypeScript**.

- **Next.js App Router** means pages and layouts live inside `src/app/`. Each `page.tsx` file becomes a route.
- By default, all components are **React Server Components** — they run on the server and send HTML to the browser. This is faster and simpler for data fetching.
- Components that need browser features (like `useState`, `useEffect`, or event listeners) must opt in to client-side rendering by adding `"use client"` at the top of the file.

---

## Project Structure

```
src/
  app/              # Routes and global styles
    layout.tsx      # Wraps every page with Header and Footer
    page.tsx        # The only page (the landing/quiz page)
  components/       # UI building blocks
    header/         # Top navigation bar
    footer/         # Bottom bar
    landingAside/   # "How it works" info panel
    quizForm/       # The form for selecting themes and difficulty
    quiz/           # Renders the fetched quiz questions
  services/         # Functions that talk to the external API
  models/           # TypeScript types describing the data shapes
  lib/              # Small helper utilities
  styles/           # Global CSS variables (colors etc.)
```

---

## How Data Flows Through the App

Here is the step-by-step journey from the user clicking "Generera quiz" to seeing questions on screen.

### 1. The user fills in the form (`QuizForm`)

`src/components/quizForm/quizForm.tsx` is a **client component** (`"use client"`).

When the form is submitted, it:

1. Reads the selected themes and difficulties from the form inputs.
2. Builds a URL query string, e.g. `?themes=history&difficulties=easy&generate=true`.
3. Navigates to that URL using `router.push()` from Next.js.

```
User submits form → URL becomes /?themes=history&difficulties=easy&generate=true
```

The form also loads theme options on first render by fetching all available questions from the API and extracting unique theme names from them.

### 2. The Home page reads the URL (`page.tsx`)

`src/app/page.tsx` is a **server component**. It receives the URL search params (the `?...` part of the URL) as a prop called `searchParams`.

It extracts:

- `themes` — which theme(s) the user selected
- `difficulties` — which difficulty levels the user selected
- `generate` — whether the user has clicked "Generera quiz"

```ts
// Only render the Quiz component when generate === "true"
const hasGenerated = params.generate === "true";
```

If `hasGenerated` is `true`, it renders the `Quiz` component and passes the themes and difficulties as props.

### 3. The Quiz component fetches questions (`Quiz`)

`src/components/quiz/quiz.tsx` is an **async server component** — it can use `await` directly inside the function body, without `useEffect`.

It calls `getQuestions()` which goes through this service chain:

```
Quiz component
  → getQuestions()            (src/services/quizService.tsx)
    → buildUrl()              (src/services/utils/buildUrl.tsx)
    → getData()               (src/services/serviceBase.tsx)
      → fetch(API_URL)        (external API call)
```

#### `buildUrl` (`src/services/utils/buildUrl.tsx`)

Turns an array of values into a URL query string fragment.

```ts
buildUrl(["history", "science"], "&themes=");
// returns: "&themes=history&themes=science"
```

#### `getData` (`src/services/serviceBase.tsx`)

A thin wrapper around the browser's built-in `fetch()` function. Combines the base URL with the themes and difficulties fragments and makes the HTTP GET request.

#### `getQuestions` (`src/services/quizService.tsx`)

Calls `getData`, checks the response, parses the JSON, and returns a `QuestionResponse` object.

### 4. Questions are displayed

Once `getQuestions()` resolves, `Quiz` maps over the `questions` array and renders each one as a row with the question text and its answer.

---

## Data Types (`src/models/types.tsx`)

These TypeScript types describe the shape of data returned from the API, so the compiler can catch mistakes early.

```ts
type QuestionResponse = {
  totalResult: number; // how many questions were returned
  questions: Question[]; // the array of question objects
};

type Question = {
  question: string; // the question text
  answer: string; // the correct answer
  themes: string[]; // e.g. ["history", "science"]
  difficultyLevel: string; // "easy", "medium", or "hard"
  id: number; // unique identifier for the question
  // ...and a few more fields
};
```

---

## How Clearing the Quiz Works

The "Rensa quiz" (Clear quiz) button is a `<Link>` that navigates to `/?generate=false`.

Because `page.tsx` reads the URL and only renders `<Quiz>` when `generate === "true"`, navigating to `/?generate=false` causes Next.js to re-render the page without the `Quiz` component. This automatically removes both the search summary (messageContainer) and the question list (quizContainer) from the page — no extra state management needed.

```
User clicks "Rensa quiz"
  → URL becomes /?generate=false
  → Home re-renders
  → hasGenerated is false
  → Quiz component is not rendered → page is visually cleared
```

---

## URL as the Source of Truth

A key concept in this app: **the URL is the single source of truth for what is shown on screen**.

| URL                                                | What the user sees            |
| -------------------------------------------------- | ----------------------------- |
| `/`                                                | Form only, no quiz            |
| `/?generate=false`                                 | Form only, no quiz            |
| `/?themes=history&difficulties=easy&generate=true` | Form + fetched quiz questions |

This means:

- Users can bookmark or share a quiz result URL.
- Pressing the browser back button naturally restores the previous state.
- No complex global state library (like Redux) is needed.

---

## Responsive Layout

The page uses a **mobile-first CSS flex layout**.

- On **mobile** (<992px): the aside info panel sits above the form/quiz section.
- On **desktop** (≥992px): the aside moves to the left, and the form/quiz section is centered on the right.

The header navigation follows the same breakpoint:

- On **mobile**: a hamburger button toggles a dropdown menu.
- On **desktop**: navigation links are always visible inline in the header.

---

## Styling System

All global colors are defined as CSS variables in `src/styles/variables.css`:

| Variable            | Value     | Used for                                  |
| ------------------- | --------- | ----------------------------------------- |
| `--prim-bg-color`   | `#091c1c` | Page background, dark green text          |
| `--prim-text-color` | `#f5d5d5` | Soft pink, card backgrounds               |
| `--sec-bg-color`    | `#231c2b` | Secondary background areas                |
| `--accent`          | `#c69d9e` | Borders, focus outlines, hover highlights |

Each component has its own **CSS Module** (e.g. `quiz.module.css`). CSS Modules automatically scope class names to the component so there are no accidental style conflicts between components.

---

## Running the Project Locally

```bash
# Install dependencies
npm install

# Start the dev server (visit http://localhost:3000)
npm run dev

# Check for code style errors
npm run lint

# Build for production
npm run build
```
