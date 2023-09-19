# PyReactApp
This application implements Python-Flask, MongoDB, and React.js to model an inventory management system.

## Features:
  * User Login using salted and encrypted passwords
  * Account Creation and Storage
  * Project Creation
  * Resource checkout and check-in with validation of available resources
  * Users may request to join projects as a member
  * Project creators/leads can approve/deny join requests, remove members from the project, and delete the project
  * Log in state is maintained throughout the application

## Tech:
  * MongoDB Atlas for free, cloud DB 
  * PyMongo to facilitate DB connection to front end
  * React.js front end using useEffect to retrieve data from Flask REST APIs
  * React front end styled using Bootstrap and Material UI open source components
  
