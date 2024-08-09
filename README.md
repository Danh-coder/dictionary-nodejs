
# HelloWorld - A Dictionary Website

## Table of Contents
1.  [Introduction](#introduction)
2.  [Features](#features)
3.  [Technologies Used](#technologies-used)
4.  [Architecture Overview](#architecture-overview)
    -   [Front End](#front-end)
    -   [Back End](#back-end)
    -   [Database](#database)
5.  [Setup and Installation](#setup-and-installation)
    -   [Prerequisites](#prerequisites)
    -   [Installation Steps](#installation-steps)
6.  [Usage](#usage)
7.  [API Documentation](#api-documentation)
    -   [Endpoints](#endpoints)
    -   [Authentication](#authentication)
    -   [Error Handling](#error-handling)
8.  [Deployment](#deployment)
9.  [Testing](#testing)
10.  [Contributing](#contributing)
11.  [License](#license)
12.  [Contact](#contact)

## Introduction
This project is developed to address the coursework of course Web Programming 2 COMP1842. The coursework is about creating an online personal dictionary application, where users input words in English and their translations to any languages users want.

The following sections will explain unique features, as well as technologies used and architecture from front-end to back-end and database. Furthermore, there will be instructions on how to setup and run this website on your machine.

## Features
Here are the features designed to provide a smooth and effective user experience:

 - **Comprehensive Dashboard**: Access a detailed and interactive dashboard that provides an overview of your dictionary and basic functions to explore deeper about words.
 - **Data Import & Export**: Input a wide range of words with just a CSV file or export for further processing or a backup data.
 - **Dynamic Language Translation**: Available to add and remove any language.
 - **Languages with Their Flag Images API (Unexpected)**: Be able to fetch all languages with their original country flag images just by an API call.

## Technologies Used
**HelloWorld** is built using a modern tech stack that ensures performance, scalability, and maintainability. Below is an overview of the key technologies used in the project:

### Front End

-   **Vue**: A powerful JavaScript library for building user interfaces, React is used to create dynamic, component-based UIs that are responsive and highly interactive.
-   **Bootstrap**: A popular CSS framework that provides pre-designed components and a responsive grid system, helping to create a consistent look and feel across the application.

### Back End

-   **Node.js**: The back-end of the application is powered by Node.js, enabling fast and scalable server-side scripting with JavaScript.
-   **Express**: A minimalist web framework for Node.js, Express is used to build the API and handle HTTP requests, routing, and middleware management.
- **Gemini API**: An API to call Gemini to do specific tasks, for example translation.

### Database

-   **MongoDB**: A NoSQL database that stores data in JSON-like documents, MongoDB is chosen for its flexibility and scalability in handling unstructured data.
-   **Mongoose**: An Object Data Modeling (ODM) library for MongoDB, Mongoose simplifies data validation, schema design, and querying.

## Architecture Overview

**HelloWorld** is designed with a layered architecture that separates concerns across the front end, back end, and database, ensuring scalability, maintainability, and ease of development. Below is an overview of each layer in the architecture:

### Front End

-   **Framework/Library**: The front end is built using **Vue.js**, a progressive JavaScript framework that is highly flexible and easy to integrate with other projects or libraries. Vue's component-based architecture allows for the development of reusable and self-contained UI components, promoting a modular and maintainable codebase.

-	**Bootstrap** is incorporated to provide a consistent design language, combining Bootstrap's responsive components with Vue's reactivity.
    
-   **API Integration**: The front end communicates with the back end via RESTful APIs. **Axios** is used for making HTTP requests, providing a promise-based interface for data fetching, handling responses, and managing errors, including token-based authentication for secure API calls.

### Back End

-   **Framework/Language**: The back end is powered by **Node.js** and **Express**, providing a lightweight and efficient server-side environment. This setup allows the application to handle a large number of concurrent requests with minimal overhead.
    
-   **API Design**: The application exposes a set of RESTful APIs that follow best practices in API design. These APIs are responsible for handling CRUD (Create, Read, Update, Delete) operations, and data processing tasks.
    
-   **Middleware**: The back end leverages various middleware for error handling, and data validation. This ensures that incoming requests are properly processed and any issues are caught early in the request lifecycle.

### Database

-   **Database Type**: The application uses **MongoDB**, a NoSQL database that stores data in a flexible, JSON-like format. This allows for easy storage and retrieval of complex data structures, making it well-suited for dynamic and unstructured data.
    
-   **Schema Design**: Data in MongoDB is organized into collections and documents. **Mongoose** is used to define schemas for the data, providing a structure and validation rules to ensure data integrity. Relationships between different entities are managed through references and embedded documents, balancing normalization and denormalization for optimal performance.

> Written with [StackEdit](https://stackedit.io/).