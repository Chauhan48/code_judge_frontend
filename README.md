# CodeJudge - Client

A React-based web application for managing and administering online coding assessments. This frontend enables admins to create coding challenges, invite candidates, monitor submissions, and view candidate progress in real-time.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Key Features](#key-features)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Environment Configuration](#environment-configuration)
- [File Descriptions](#file-descriptions)
- [Workflow Examples](#workflow-examples)
- [Development Guidelines](#development-guidelines)

---

## Overview

CodeJudge is an online coding judge platform where:

- Admins can create coding problems with test cases
- Admins invite candidates via email to take assessments
- Candidates access tests via token-based links
- Submissions are evaluated in real-time
- Admins can monitor candidate progress and attempt history

This repository contains the client-side React application that provides the user interface for both admin and candidate workflows.

---

## Technology Stack

- React (v19.2.0) - UI library
- Vite (v7.3.1) - Build tool and development server
- React Router DOM (v7.13.1) - Client-side routing
- Tailwind CSS (v3.4.19) - Utility-first CSS framework
- Axios (v1.13.5) - HTTP client for API communication
- Monaco Editor (v4.7.0) - Code editor component for writing and submitting code
- Recharts (v3.7.0) - Charting library for analytics
- ESLint (v9.39.1) - Code linting and quality checks

---

## Folder Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── api/                   # API service modules
│   │   ├── axios.js          # Axios instance with interceptors
│   │   ├── authApi.js        # Authentication endpoints
│   │   ├── adminApi.js       # Admin-only API calls
│   │   └── testApi.js        # Test and candidate endpoints
│   │
│   ├── components/            # Reusable React components
│   │   └── CandidateAttemptsChart.jsx  # Chart for visualizing attempts
│   │
│   ├── context/               # React Context for state management
│   │   └── AuthContext.jsx    # Authentication context provider
│   │
│   ├── pages/                 # Page components (one per route)
│   │   ├── Login.jsx          # User login page
│   │   ├── Register.jsx       # User registration page
│   │   ├── Dashboard.jsx      # Admin dashboard with stats
│   │   ├── AddProblem.jsx     # Create new coding problem
│   │   ├── InviteCandidate.jsx # Send invites to candidates
│   │   ├── TestPage.jsx       # Test interface for candidates
│   │   └── Progress.jsx       # View candidate progress details
│   │
│   ├── routes/                # Route protection and wrappers
│   │   └── ProtectedRoutes.jsx # Authentication guard for routes
│   │
│   ├── App.jsx               # Main application component with routing
│   ├── App.css               # Application-level styles
│   ├── main.jsx              # React DOM entry point
│   └── index.css             # Global styles
│
├── index.html                # HTML template
├── package.json              # Project dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

---

## Key Features

### Admin Panel
- Dashboard: View overall platform statistics (total candidates, active sessions, submissions count, users attempted)
- Add Problem: Create coding challenges with multiple test cases (public and hidden)
- Invite Candidate: Send email invitations with unique test tokens
- View Progress: Monitor each candidate's attempt history and problem solutions
- Real-time Stats: Statistics updated from backend API

### Candidate Portal
- Test Interface: Access coding problems via unique token
- Code Editor: Write solutions using Monaco Editor with syntax highlighting
- Language Support: Toggle between Java, JavaScript, C++, and Python
- Submit and Run: Execute code against test cases and receive feedback
- Attempt History: Review past submissions and results

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes for admin-only sections
- Token stored in localStorage

---

## Setup Instructions

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation Steps

1. Clone the repository and navigate to the client directory:
   ```bash
   cd /home/anshit/Desktop/online-coding-judge/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify the backend API is running on localhost:3000 (optional but recommended for testing)

---

## Running the Application

### Development Mode

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at http://localhost:5174 (or the next available port if 5174 is in use).

### Build for Production

Create an optimized production build:

```bash
npm run build
```

Output will be generated in the dist/ directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Lint Code

Check code quality and style:

```bash
npm run lint
```

---

## API Endpoints

The following backend API endpoints are used by this client application:

### Authentication
- POST /api/auth/register - Register new admin user
- POST /api/auth/login - Authenticate and receive JWT token

### Admin Operations
- GET /api/admin/candidates - List all invited candidates with status
- GET /api/admin/stats - Get platform statistics (optional testId parameter for scoped stats)
- POST /api/admin/invite - Send invitation email to candidate
- POST /api/admin/problems - Create new coding problem
- GET /api/admin/submissions - Get submissions for a specific problem and candidate

### Test and Candidate Operations
- GET /api/test - Fetch test details using token query parameter
- POST /api/test/run - Execute candidate code against test cases
- GET /api/test/progress - Fetch candidate progress using token query parameter

---

## Environment Configuration

### API Base URL

The Axios instance uses a relative base URL (/api) defined in src/api/axios.js. During development, Vite's proxy feature forwards these requests to the backend server (typically running on localhost:3000). In production, ensure the frontend and backend are served from the same origin or configure CORS appropriately.

### Authentication Token

After login, the JWT token is stored in localStorage with key "token". This token is automatically included in all API requests through an Axios request interceptor.

### API Request Flow

1. User logs in via Login.jsx
2. Backend returns JWT token
3. Token is stored in localStorage
4. Axios interceptor attaches token to every subsequent request as Authorization: Bearer <token>
5. Protected routes verify token presence; unauthenticated users are redirected to login

---

## File Descriptions

### API Layer (src/api/)

**axios.js** - Configured Axios instance that:
- Sets baseURL to /api
- Automatically attaches JWT token from localStorage to request headers
- Logs request/response errors for debugging

**authApi.js** - Authentication-related API calls:
- User registration
- User login

**adminApi.js** - Admin-specific API calls:
- Invite candidate
- Add problem
- Get problems
- Get submissions
- Get candidates list
- Get platform statistics

**testApi.js** - Test and candidate-facing API calls:
- Get test by token
- Run/execute code
- Get candidate progress by token

### Components (src/components/)

**CandidateAttemptsChart.jsx** - Recharts-based visualization component for displaying submission attempt patterns and statistics.

### Context (src/context/)

**AuthContext.jsx** - React Context that manages global authentication state (user info, login status). Provides auth state to all application pages without prop drilling.

### Pages (src/pages/)

**Login.jsx** - Entry point for authentication. Form to log in with email and password.

**Register.jsx** - New user registration form. Creates admin account.

**Dashboard.jsx** - Main admin panel showing:
- Platform statistics cards (candidates, sessions, submissions, attempts)
- Quick action buttons (invite, add problem, view progress, etc.)

**AddProblem.jsx** - Form to create coding problems with:
- Title and description
- Public test cases
- Hidden test cases
- Difficulty level (if applicable)

**InviteCandidate.jsx** - Form to invite candidates:
- Enter candidate email
- Select test to assign
- Send invitation email with token link

**TestPage.jsx** - Candidate-facing interface showing:
- List of assigned coding problems
- Code editor (Monaco)
- Language selector
- Submit button
- Submission history
- Run output

**Progress.jsx** - Admin view for monitoring candidate progress:
- List of all invited candidates
- Click email to view individual progress
- Display problem attempt counts and last submission details

### Routes (src/routes/)

**ProtectedRoutes.jsx** - Higher-order component that:
- Checks for valid JWT token in localStorage
- Redirects unauthenticated users to /login
- Wraps admin-only pages

### Root Files

**App.jsx** - Main application component containing:
- BrowserRouter setup
- Route definitions for all pages
- ProtectedRoute wrapping for admin sections

**main.jsx** - React DOM entry point that mounts App component to #root element

**index.css** - Global CSS (Tailwind imports)

**App.css** - Application-level component styles

---

## Workflow Examples

### Admin Workflow

1. Admin logs in at /login
2. Redirected to /dashboard showing platform statistics
3. Admin clicks "Add Problem" to navigate to /problems/add
4. Creates a coding challenge with test cases
5. Returns to dashboard and clicks "Invite Candidate"
6. Enters candidate email and selects test, sends invitation
7. Admin can later view candidate progress at /progress by clicking candidate email from list

### Candidate Workflow

1. Candidate receives email with test link containing unique token
2. Candidate clicks link (e.g., /test?token=abc123xyz)
3. TestPage loads test details using the token
4. Candidate selects problems from left sidebar
5. Writes solution in Monaco Editor
6. Selects programming language
7. Clicks Submit to send code to backend
8. Receives pass/fail result and submission history

---

## Development Guidelines

### Adding a New Page

1. Create new component file in src/pages/{PageName}.jsx
2. If admin-only, wrap route with ProtectedRoute in App.jsx
3. Add navigation button or route in appropriate location

### Adding a New API Endpoint

1. Create or update the corresponding API module in src/api/
2. Use the configured api instance from axios.js
3. Include appropriate query parameters or request body
4. Handle errors in calling component

### Styling

- Use Tailwind CSS utility classes for styling
- Avoid inline styles or class-based CSS
- Dark theme colors: bg-gray-950, bg-gray-900, text-gray-100
- Accent colors: indigo, green, yellow, red

---

## Troubleshooting

### Port Already In Use
If Vite reports port 5173 is in use, it automatically tries the next port (5174, 5175, etc.). Check terminal output for the actual URL.

### API Requests Failing
- Verify backend server is running on localhost:3000
- Check browser Network tab for request/response details
- Ensure JWT token is valid and not expired
- Check browser console for Axios error logs

### Styles Not Applied
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Verify Tailwind CSS build process completed successfully
- Check that TailwindCSS classes are spelled correctly

### Monaco Editor Not Loading
- Verify @monaco-editor/react package is installed
- Check that code editor height is set on parent container
- Check browser console for any module loading errors

---

## Future Enhancements

- Real-time collaboration features
- Advanced analytics and reporting
- Plagiarism detection
- More programming languages
- Problem categorization and filtering
- Leaderboards and rankings
- Comprehensive time tracking metrics

---

## Support

For issues, feature requests, or contributions, please refer to the main project repository or contact the development team.


