PHASE 1: Complete
Set up project

🚀 PHASE 2: Authentication & Greeting Flow
Anonymous Authentication

On first visit, create an anonymous Firebase user

Store anonymous ID in localStorage for session continuity

Greeting Modal

Create GreetingModal component

Welcome text

How it works

“Login / Sign up” button

“Skip for now” option

Modal should show on first visit or if modal manually triggered

Auth Modal

Create AuthModal with:

Tabs for Login / Signup

Email & Password input

Google Sign-In button

After login/signup:

If first time (check Firestore), trigger Onboarding

🧍‍♀️ PHASE 3: User Onboarding
Onboarding Flow

Modal or step-by-step form after auth

Name

Birthday

Color (color picker or dropdown)

Optional Bio

Save to users collection under user ID

Profile Modal

Show current user info

If admin, show admin options

If not logged in, show login modal instead

🏠 PHASE 4: Main Page (Houses/Clubs Overview)
Fetch & Display Clubs

Query Firestore clubs collection on page load

Map each club to a “house” card/component

Static UI Elements

Top Left: "i" icon to re-open greeting modal

Top Right: Login/Profile icon

🏡 PHASE 5: Club Modal + Apply Flow
Club Modal

Show club info (name, desc, leader, time, communication, commitment)

List member names from user IDs

Image carousel if images are present

“Apply to Join” button at the bottom

Apply Modal

User fills out application form

Save to applications collection with user ID and club ID

Show “Thank you” confirmation

👑 PHASE 6: Admin System
Main Admin Page (Global Admin Only)

Restricted access (check currentUser.uid)

View and edit:

All users

All clubs

All applications

Manage applications globally

Club Admin Modal

When a club leader views a club:

Check if currentUser.uid === leaderID

If yes:

Enable inline editing of club details

Add tab to view applications

Accept/reject members

Remove users

Upload images/content to storage

🖼 PHASE 7: Extra Modals and Polish
Suggest a Club Modal

Optional form modal to suggest new club ideas (not mentioned in flow, but in modal list)

Polishing

Responsive layout

Animations/transitions for modals

Toasts for feedback (e.g., application sent, profile updated)

Light/dark mode (optional)

Clean up unused code, split large files