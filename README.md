# Sorta - NFT Whitelist Tracker

Sorta is a web app for NFT enthusiasts to track their whitelisted projects, manage mint dates, and organize their crypto wallets.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Database:** Supabase
- **UI:** shadcn/ui & Tailwind CSS

## Running the Project Locally

1. **Clone the repository:**
   ```bash
   git clone <https://github.com/emjaycodesss/Sorta.git>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a file named `.env.local` in the root of the project.
   - Add your Supabase URL and Anon Key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - **Note:** You'll need to create a Supabase project and get these values from your project settings.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Supabase Setup

To use this application, you'll need to:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials** from the project settings
3. **Set up the database tables** using the SQL scripts provided in the documentation
4. **Add your credentials** to the `.env.local` file
