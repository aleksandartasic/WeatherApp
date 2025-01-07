# Weather Application

This is a weather application project developed as part of a university course. The application is built using **Node.js**, **Pug**, and **JavaScript** to provide an interface for managing weather stations and their corresponding data. While the current version does not fetch real-time weather data, users can manually add and manage weather data for fictional or real stations.

---

## Features
- Manage weather stations and their data.
- Add, view, and update weather data manually.
- User-friendly web interface using Pug templates.
- Modular structure for easy maintenance and scalability.

---

## Prerequisites
- **Node.js** (version 14 or later)
- **npm** (Node Package Manager)
- A database compatible with your chosen `DB_CON_STRING`.

---

## Installation

### 1. Clone the Repository
Clone the repository from GitHub to your local machine

### 2. Install Dependencies
Install all the required dependencies specified in the package.json file

### 3. Create a .env File
Create a .env file in the root directory of the project by copying the provided example.env file:

cp example.env .env

### 4. Configure the .env File
Edit the .env file and provide the necessary configuration, like in provided example.env file:

PORT=3000

DB_CON_STRING=your_database_connection_string

API_KEY=your_api_key

Replace your_database_connection_string with the connection string for your database

Replace your_api_key with an API key if needed (currently not used in this version)

## Running the Application

### 1. Start the Application
npm start

### 2. Open in Your Browser
http://localhost:3000

### 3. Register and Log In
Navigate to the registration page and create an account

Log in with your credentials to access weather station functionalities


