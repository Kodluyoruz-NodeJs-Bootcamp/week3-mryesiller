## Week3-mryesiller Gusto&RemoteTeam Typescript Auth project
<hr>

<p> In this project, the user can create his own account and log in to the system. After logging into the system, he can change his registration information and password, and if he wishes, he can also delete his account. Login is required to view user records.</p>

## Technologies 

* NodeJS
* Typescript
* Nodemon
* Static Files (express.static)
* Template Engine (pug)
* Express
* Express-flash
* Express-session
* MongoDB
* Mongoose
* Passport
* Bcrypt
* jsonwebtoken
* MVC architecture

## Installation

Clone the project to your local repository
```javascript
git clone https://github.com/Kodluyoruz-NodeJs-Bootcamp/week3-mryesiller

```
Install the dependencies of the project

```
npm install
```
Change  .env file in the project's directory. Environment variables inside your .env file should look like this

```
MONGODB_URI_LOCAL=<enter your mongo db uri here>
SESSION_SECRET=<enter an arbitrary string here>
JWT_SECRET=<enter an arbitrary string here>
PORT=<enter your port number here>
```
# Project images 

![Home Page](/image/gusto_home.png)
<hr>
![Login Page](/image/gusto_login.png)
<hr>
![Signup Page](/image/gusto_signup.png)
<hr>
![Profile Page](/image/gusto_profile.png)
<hr>
![Users Page](/image/gusto_users.png)

