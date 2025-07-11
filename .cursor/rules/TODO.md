---
alwaysApply: true
---
# Sorta - Development To-Do List

This document outlines the development tasks required to build the Sorta application. It's structured by phases to guide the development process from initial setup to feature implementation.

---

## Phase 1: Project Setup & Foundation

The goal of this phase is to create the project structure, install dependencies, and establish a connection to the database.

-   [ ] **Initialize Git Repository**
    -   [ ] `git init` in the project folder.
    -   [ ] Create an initial commit.
    -   [ ] Create a repository on GitHub/GitLab and push the initial commit.

-   [ ] **Next.js Project Setup**
    -   [ ] Initialize a new Next.js 14+ project with TypeScript and Tailwind CSS: `npx create-next-app@latest --typescript --tailwind --eslint .`
    -   [ ] Clean up the default boilerplate code from the main page.

-   [ ] **UI & Styling Setup**
    -   [ ] Initialize `shadcn/ui`: `npx shadcn-ui@latest init`
    -   [ ] Apply the custom theme: `npx shadcn@latest add https://tweakcn.com/r/themes/cmcyfvy3l000004ju9n78d6kw`
    -   [ ] Install core `shadcn/ui` components needed for the layout (e.g., `button`, `card`, `input`, `dropdown-menu`).

-   [ ] **Theme (Light/Dark Mode) Setup**
    -   [ ] Install the `next-themes` package: `npm install next-themes`
    -   [ ] Create a `ThemeProvider` component to wrap your application.
    -   [ ] Create a `ThemeToggle` component (e.g., a button with a moon/sun icon) that allows users to switch modes.
    -   [ ] Add the `ThemeProvider` to your root `layout.tsx`.    

-   [ ] **Supabase Setup**
    -   [ ] Create a new project on the [Supabase website](https://supabase.com/).
    *   [ ] In the Supabase SQL Editor, run the `CREATE TABLE` scripts for `projects`, `wallets`, and `project_wallets`.
        *   *Crucial:* Ensure the `status` column in the `projects` table has a `DEFAULT` value of `'Pending'`.
        *   *Crucial:* Set up the foreign key relationships correctly.
    -   [ ] Install the Supabase client library: `npm install @supabase/supabase-js`
    -   [ ] Create a `.env.local` file in the root of your Next.js project.
    -   [ ] Add your Supabase Project URL and Anon Key to `.env.local`.

---

## Phase 2: Core Feature Implementation - Backend Logic & UI

Build out the core features of the application, component by component.

### 2.1 Wallet Management
-   [ ] **Create "Wallets" Page UI**
    -   [ ] Create a new route `/wallets`.
    -   [ ] Build a layout to display wallets, grouped by chain (`Card` components would work well).
-   [ ] **Add/Edit Wallet Functionality**
    -   [ ] Create a form (using `shadcn/ui` `Dialog` or a dedicated page) to add a new wallet (fields: `wallet_address`, `chain`).
    -   [ ] Write the function to insert/update wallet data in the `wallets` table in Supabase.
    -   [ ] Add "Edit" and "Delete" buttons for each wallet.

### 2.2 Project Management
-   [ ] **Create "Add Project" Form**
    -   [ ] Use a `Dialog` or a new page at `/projects/new` for the form.
    -   [ ] Add all project fields using `shadcn/ui` components: `Input` for text, `Select` for chain/whitelist type, `DatePicker` for mint date, `Textarea` for notes.
-   [ ] **Wallet Dropdown**
    -   [ ] The "Eligible Wallet" field should be a `Select` or `ComboBox` that fetches the user's wallets from your Supabase `wallets` table.
    -   [ ] Include a button within the dropdown to "Add a new wallet..." which opens the wallet creation form.
-   [ ] **Backend Logic for Projects**
    -   [ ] Write the function to save a new project to the `projects` table. Remember, the status defaults to `Pending`.
    -   [ ] Write the logic to link the selected wallets to the project in the `project_wallets` junction table.

### 2.3 Dashboard
-   [ ] **Dashboard Layout**
    -   [ ] Design the main dashboard page (`/`).
    -   [ ] Build the summary `Card` components for stats (Mints Today, etc.).
-   [ ] **Project Data Table**
    -   [ ] Use `shadcn/ui`'s `DataTable` component.
    -   [ ] Write the Supabase query to fetch all of the user's projects.
    -   [ ] Populate the table with the data.
    -   [ ] Implement sorting functionality for key columns (like Mint Date).
    -   [ ] Implement filtering controls (`Select` dropdowns) for `status` and `chain`.
    -   [ ] Add a search `Input` to filter by `project_name`.
-   [ ] **Status Change Functionality**
    -   [ ] Add a `DropdownMenu` to each row in the data table to allow changing the status (`Minted`, `Will Pass`, `Delayed`).
    -   [ ] Write the Supabase function to update the status of a project.

### 2.4 Calendar View
-   [ ] **Calendar UI**
    -   [ ] Create a new page at `/calendar`.
    -   [ ] Integrate `shadcn/ui`'s `Calendar` component.
    -   [ ] Implement the "next" and "previous" month navigation buttons.
-   [ ] **Display Project Data**
    -   [ ] Write a query to fetch projects and mark the days on the calendar where mints are scheduled.
    -   [ ] Build the "Detailed Daily View" panel that shows on the side.
    -   [ ] When a user clicks a day, populate this panel with the projects minting on that day, including their specific times.

---

## Phase 3: Polish & Refinement
-   [ ] **Timezone Handling**
    -   [ ] Double-check that all mint times are correctly stored in UTC (Supabase `timestamptz`) and displayed in the user's local timezone.
-   [ ] **Responsive Design**
    -   [ ] Test the application on various screen sizes (desktop, tablet, mobile) and fix any layout issues.
-   [ ] **Loading & Empty States**
    -   [ ] Add loading spinners (`Skeleton` components) while data is being fetched.
    -   [ ] Create helpful messages for when there are no projects, wallets, or calendar events to show.
-   [ ] **User Experience**
    -   [ ] Add `Toast` notifications for actions like "Project Added" or "Status Updated".
    -   [ ] General bug fixing and quality assurance.

---

## Phase 4: Future Features (Post-MVP)

These are features from the original plan that can be implemented after the core application is stable.

-   [ ] **User Authentication**
    -   [ ] Implement full user sign-up, login, and logout using Supabase Auth.
    -   [ ] Implement Row Level Security (RLS) policies on all tables to ensure users can ONLY see and manage their own data.
-   [ ] **Notifications**
-   [ ] **Analytics Page**

