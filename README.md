# launch24-swe-week2-team5
SpotiMy

Project Description

	Welcome to SpotiMy! 
    This is a spotify web application created by Forge Launch 2024 students in order to extend the knowledge of API requests and firebase while incorporating skills such as Express backend and authentication. 
    In order to use this application, the user should make sure their account is within the spotify for developers list of users of our project. 
    This web application was created in order to keep users engaged with Spotify by allowing multiple features within the app. 
    The features of the web application include: liked songs playlist, top artists, and top songs of all time, last year, or last months,a profile page, discover page, forums page and an inbox to send messages between users.

Table of Contents

    Project Description 
    Installation
    How to use Project
    Major Features and Components
    Current Status
    Credits

Installation
    Initial setup: 

        Begin by cloning the github repo with the following command 
        (you may need to first either fork the repo or request permissions to do so if not already allowed): 
        git clone https://github.com/Ethan-code-1/launch24-swe-week2-team5.git 

        Open VS code with devcontiner extension and open project in container with docker desktop open

        Next change directories into the front end folder and within the vite-project folder run the following command: 
        -npm install 

        Next change directories into the backend folder and run the following command: 
        Npm install express nodemon cors –save-dev nodemon 

        *To view specific installations taking place when using npm install, refer to the description section of the package,json file. 

        In addition, go to the firebase portal and generate a new private key, which will be downloaded locally to your computer. 
        Rename this file permissions.json and add it to the backend folder. This serves as your credentials to access the firebase database. 

        *Both the back and front end files contain a .gitignore, 
        which is set up to already include all the anticipated private files within the project (node_modules, permissions.json, and .env)

    Spotify Setup:

        Login with a spotify account to https://developer.spotify.com/ and click on your name in the top right to go to your dashboard. 

        Create a new app, giving it an App name and description. For the field Redirect URLs paste in
        http://127.0.0.1:5001/spotify/callback
        Then for the section that asks “Which API/SDKs are you planning to use?” select Web API then click save.

        You now need to add users to your app by clicking on the newly created app, go to settings in the top right, 
        click on the tab named User Management, and give a name and email that you will login with. 

        Then click on the tab on the left called Basic Information and you will see Client ID and Client Secret. 
        Create a new .env file in the ‘backend’ root directory and paste in the codes with variable name in parentheses
        CLIENT_ID= “”
        CLIENT_SECRET=”” 


    Running the App:

        To run the app locally you first need to open two terminals. 
        In one terminal change directories into the vite-project folder. 
        Within this folder start the front end by running the command:
        Npm run dev

        Next, to start the back end change directories in into the backend folder and run the command:
        Npm start

        Running both commands should ensure the front and back end are properly running. 
        If you return to the command where you ran npm run dev, you should see a local host link which you can copy into the browser to run the file. 
        


    How to use Project
        Login with a Spotify: Once logged in you can navigate to different pages by clicking on the side bar
        Profile page: Other people can view this page and you can adjust options to decide what is made public
        Discover Users: You are able to search and find other users with the ability to search up certain ones. If clicked on a user’s card, you will be sent to their profile page
        View top artists: View your top artists from different ranges (Weekly, Monthly, Yearly)
        View top songs: View your top songs from different ranges (Weekly, Monthly, Yearly)
        View liked songs: View you saved liked songs in order of recently added. If clicked the artist’s name on the song, a popup will appear showing the artist’s profile picture and information
        Forums: Participate in public discussions on the forum page by creating and responding to posts along with the ability to upvote and downvote posts
        Messaging: Send and review messages through the inbox page. Here you will see the ability to view your incoming inbox as well as create your own mail to send to specific users

    Major Components and Features 
        Users log in with their spotify account and are able to view their top songs, top artists, and liked songs along with general spotify stats.
        Users can choose to make their profiles public or private and display certain profile information publicly.
        Users can make posts on the forums page which are viewable by all other users and reply to other users’ posts.
        Users can view other public users’ profiles and dm them.



    Current Status
        Login
            COMPLETED: 
                spotify authentication
            IN PROGRESS:
                Username for our app
                Login page frontend
        Profile
            COMPLETED:
                Fetching profile data from spotify
                Explore view for public profiles
            IN  PROGRESS
                Navigating to individual public profiles (setting up routes)
                Profile page (UI and setting public/private functionality)
                Public profile page
        Forums 
            COMPLETED:
                Frontend for displaying messages
                Frontend for posting a message
                Backend for fetching and posting a message
            IN PROGRESS:
                Edit/delete frontend and backend
        Dms 
            COMPLETED:
                Frontend for displaying and adding/deleting messages
                Backend for displaying and deleting messages
            IN PROGRESS:
                Backend for adding messages
                Fontend and backend for editing messages?
        Liked Songs
            COMPLETED:
                Frontend for displaying the users liked songs
                Fetching data from spotify api
            IN PROGRESS:
                Delete from liked songs function
        Top Songs
            COMPLETED:
                Frontend for displaying users top songs
                Fetching data from spotify api
            IN PROGRESS:
                UI for the page


    Credits 
        Collaborators:
            Ethan Ogilvie – Software Engineer
            Jason Pham – Software Engineer
            Rayna Bhattacharyya – Software Engineer
            Omar Hashi – Software Engineer
            Sara Inoue – Software Engineer

        Special Thanks to:
            Spotify API - for providing necessary API services for this project.
            Forge Launch 2024 Program - for tasking and supporting this project.


