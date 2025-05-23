This is an app called digital haven which acts as a place for online clubs. It is currently in a “mocked up” stage where I have it looking as i want but it needs to be functional. I have already connected a firebase application. Here is the flow that needs to happen:
1. When a user first visits the page, it creates an annonamous user. And greets them with a modal. The modal should welcome them, explain to them how this website works and what it is. It should then have a big button to login/signup, or users can choose to skip if they want. 
2. If a user chooses to login/signup, bring them to a login/signup modal where they can create or log into an account with either email and password or with google. Once their signing in is complete, there should be a one time onboarding flow. The user should tell us their name, color, birthday and an optional bio.
3. Either way, after either signing up/loggging in, or skipping the modal dissapears and users are on the main page. When the page first loads, the firestore database should be queried for all of the clubs and list them out as the “houses”. There should be an icon in the top left which is the “i” icon and it will re-bring up the modal. In the top right there is either a profile icon or a login in button depending on if you are logged in or not. clicking on it will either bring you to a profile page or a loggin modal. 
4. If you click on a house a modal pops up that shows the house. This modal should show everything about the house, including its members, description, name, leader name, meeting time, date created, communication method, commitment level, etc. At the bottom there should be a button that says “Apply to join this club” and brings up the apply modal
5. The apply modal is simple and is just an application form for the club. If the user submits this form it tells them thank you and to keep an eye on their inbox for further instruction. 
6. There is one main admin page that only the leader of this entire website can go to. This page can control everything from seeing all of the users, clubs, etc. They can edit any club information if needed. There is also a page to see all of the incoming applications for clubs. They are allowed to review club members and accept them. 
7. There is also an admin modal for each club that only the club leader can access. When they go to the club modal, it will automatically check if their id is the club leader id, and if it is, it will show the same modal but that has completely editable fields. There will also be a tab at the top to view incoming applications and for them to view these applications and accept or deny. They can kick any user in their club, add images/content, etc.

database structure:
clubs
- commitmentLevel: number
- communicationMethod: string
- dateCreated: date
- description: string
- images
    - list of strings to path of image stored in storage bucket
- leaderName: string
- leaderID: userid
- meetingTimes
    - list of strings
- members
    - list of member ids
- name
    - string
users
- bio: string
- birthday: date
- color: string (hex code)
- name: string
applications
- userID: userid
- clubID: clubid
- name: string
- bio: string
- birthday: date
- whyWantToJoin: string
- anythingWeShouldKnow: string

pages:
- main page
- admin page

modals:
- greeting modal
- login/signup modal
    - email and password
    - google
- profile modal
    - admin side
- club modal
- apply to club modal
- suggest a club modal

Things to keep in mind:
- Keep a clean, simple asthetic
- Keep the code clean, using new files for new components