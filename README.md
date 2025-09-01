# Web-Based Address Book App

A full-featured, single-page address book application built with vanilla HTML, CSS, and JavaScript. The application is designed with a responsive, dark-themed UI and persists all data in the browser's `localStorage`.

## Features

- **Add, Edit, and Delete Contacts**: A user-friendly modal form allows for easy creation and modification of contacts.
- **Persistent Storage**: All contact data is saved in `localStorage`, so your address book is available across browser sessions.
- **Search Functionality**: Instantly filter contacts by name, phone, email, or address.
- **CSV Import/Export**: Easily back up your contacts to a CSV file or import contacts from a CSV file.
- **Responsive Design**: The UI is fully responsive and works seamlessly on both desktop and mobile devices.
- **Dark Theme**: A modern, easy-on-the-eyes dark theme.
- **No Frameworks**: Built with 100% vanilla JavaScript, HTML, and CSS.

## Tech Stack

- **HTML5**
- **CSS3** (with CSS Variables)
- **Vanilla JavaScript**

## Running Locally

To run this application on your local machine, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd your-repository-name
    ```
3.  **Open `index.html` in your browser:**
    You can simply double-click the `index.html` file, or right-click and choose "Open with" your favorite browser.

## Deployment

This project includes a GitHub Actions workflow that automatically deploys the application to GitHub Pages on every push to the `main` branch.

To enable this, you may need to configure the repository's settings to use GitHub Pages and select the `gh-pages` branch as the source (once the workflow has run at least once).
