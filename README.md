# Fleet Manager — Step 1: Login & Roles

This is the very first working piece of your app: a login screen that knows
whether the person signing in is a **driver** or an **admin**, and sends
them to the right place. Everything else gets built on top of this.

Follow these steps in order. Don't skip ahead — each one depends on the last.

---

## Step 0 — Things you need installed on your computer

You only do this once, ever.

1. **Node.js** (this lets your computer run the app locally so you can see
   it before it's on the internet). Download the "LTS" version from
   https://nodejs.org and install it like any normal program.
2. **A code editor** — [VS Code](https://code.visualstudio.com) is free and
   the standard choice. You don't need to learn it deeply, just use it to
   open this folder.
3. **Git** — https://git-scm.com/downloads — this is what talks to GitHub.

To check they installed correctly, open a terminal (on Mac: the
"Terminal" app; on Windows: "Command Prompt" or "PowerShell") and type:

```
node -v
git -v
```

Each should print a version number, not an error.

---

## Step 1 — Open this project

1. Unzip the `fleet-app` folder I gave you, and put it somewhere sensible,
   e.g. `Documents/fleet-app`.
2. Open VS Code → File → Open Folder → select `fleet-app`.
3. Open a terminal *inside* VS Code: menu **Terminal → New Terminal**.
   This saves you switching windows — every command below goes in there.

---

## Step 2 — Install the app's building blocks

In the terminal, type:

```
npm install
```

This downloads all the code libraries the app depends on (Next.js, the
Supabase connector, etc.) into a `node_modules` folder. It can take a
minute or two. You'll only re-run this when I add new dependencies later.

---

## Step 3 — Connect the app to your Supabase project

1. Go to https://supabase.com/dashboard and open your project.
2. In the left sidebar: **Project Settings → API**.
3. You'll see two values you need:
   - **Project URL**
   - **anon public** key (a long string of letters/numbers)
4. Back in VS Code, find the file `.env.local.example` in the project.
   Make a copy of it and rename the copy to exactly `.env.local`
   (right-click → Copy, then Rename — or in the terminal:
   `cp .env.local.example .env.local`).
5. Open `.env.local` and paste your real Project URL and anon key in,
   replacing the placeholder text. Save the file.

This file holds your project's connection details. It's listed in
`.gitignore`, meaning it will **never** be uploaded to GitHub — keeping
your keys private is handled automatically.

---

## Step 4 — Create the database table (pausing here on purpose, as agreed)

This is the step where we touch your real database, so go slow.

1. In Supabase: left sidebar → **SQL Editor** → **New query**.
2. Open the file `supabase/migrations/001_profiles.sql` in this project,
   copy its entire contents, and paste into the Supabase SQL editor.
3. Read it over — it creates one table called `profiles` that stores each
   person's name and whether they're a `driver` or `admin`, plus rules
   (called "row-level security policies") that stop drivers from ever
   reading each other's data.
4. Click **Run**. You should see "Success. No rows returned."
5. Confirm it worked: left sidebar → **Table Editor** → you should now see
   a `profiles` table (it'll be empty — that's expected, we add people next).

---

## Step 5 — Create your first admin account

There's no public "sign up" page on purpose — only an admin creates
accounts. So the very first admin has to be created by hand, once:

1. In Supabase: left sidebar → **Authentication → Users → Add user**.
2. Enter your email and a password, and click **Create user**. Copy the
   user's **ID** (a long UUID) once it's created — click on the user to see it.
3. Go to **SQL Editor → New query** and run this, swapping in your details:

```sql
insert into profiles (id, full_name, role)
values ('paste-the-user-id-here', 'Your Name', 'admin');
```

You now have one working admin login. (Once the app is further along,
you'll be able to add drivers from inside the app itself instead of doing
this by hand — that's part of Step 2 in the build order.)

---

## Step 6 — Run the app on your computer

In the VS Code terminal:

```
npm run dev
```

Then open a browser and go to **http://localhost:3000** — you should land
on the login page. Sign in with the admin email/password you just created.
You should be sent to a simple admin placeholder page confirming it
recognized you as an admin.

To stop the app, click into the terminal and press `Ctrl + C`.

---

## Step 7 — Save this to GitHub

This backs up your code and is what Vercel will later deploy from.

```
git init
git add .
git commit -m "Step 1: auth and roles"
```

Then on GitHub.com: create a new empty repository (don't add a README —
we already have one), copy the two commands it shows you under
"…or push an existing repository from the command line", and run them in
your terminal. Something like:

```
git remote add origin https://github.com/your-username/fleet-app.git
git branch -M main
git push -u origin main
```

---

## We stop here

Per your instructions, I'm **not deploying to Vercel yet**. Once you've
gone through Steps 0–7 and can log in locally as your admin account,
let me know and we'll either:
- move on to **Step 2: Vehicle & driver management**, or
- deploy this first version to Vercel so you can check it from your phone.

If anything in the steps above breaks or a command gives you an error,
paste the exact error text back to me and I'll tell you exactly what to do.
