
# CampusDesk - Auspify Task 1 Frontend

Vanilla HTML, CSS and JavaScript frontend for the Student Management System.

## Requirements

- Node.js backend running at http://localhost:5000
- MongoDB running
- Modern web browser
- VS Code with Live Server extension (recommended)

## How to Run

1. Start MongoDB.
2. Navigate to the backend folder.
3. Run:

   npm run dev

4. Open the frontend folder in VS Code.
5. Right-click index.html.
6. Select Open with Live Server.

## API Base URL

http://localhost:5000/api/v1/students

## Features

- Fetch student records
- Add student records
- Update student details
- Delete student records
- Search students
- Dashboard statistics
- Form validation
- API error handling
- Responsive layout

## Student Fields

- fullName
- email
- rollNumber
- course
- semester
- phone

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Express.js
- MongoDB
- Mongoose

## Notes

The frontend connects directly to the existing backend.

No sample student records are hardcoded.

All student information is retrieved from MongoDB through the Express API.
