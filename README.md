# ToDoWeb - Full Stack Task Management Application

A modern, full-stack ToDo application built with React, TypeScript, Node.js, and MongoDB. Features real-time notifications, task reminders, and a beautiful user interface.

## 🚀 Features

### Core Functionality

- ✅ **User Authentication** - Secure signup/login with JWT tokens
- 📝 **Task Management** - Create, edit, delete, and organize tasks
- 📋 **List Organization** - Group tasks into customizable lists
- ⏰ **Due Dates** - Set and track task deadlines
- ✔️ **Task Completion** - Mark tasks as complete/incomplete

### Advanced Features

- 🔔 **Real-time Notifications** - Socket.IO powered instant updates
- ⏰ **Smart Reminders** - Automated cron-based task reminders
- 🚨 **Overdue Alerts** - Notifications for past-due tasks
- 🔒 **Route Protection** - Secure pages with authentication guards
- 📚 **API Documentation** - Swagger/OpenAPI documentation

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **node-cron** - Task scheduling for reminders
- **Swagger** - API documentation

## 📁 Project Structure

```
ToDoWeb/
├── to-do-Backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── Controllers/     # Request handlers
│   │   ├── Models/          # MongoDB schemas
│   │   ├── Routes/          # API routes
│   │   ├── middleware/      # Auth and validation
│   │   ├── services/        # Business logic (cron jobs)
│   │   ├── utils/           # Helper functions
│   │   └── config.ts        # Database configuration
│   └── package.json
├── to-do-Front/             # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers
│   │   ├── types/           # TypeScript type definitions
│   │   └── lib/             # Utility functions
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ToDoWeb.git
   cd ToDoWeb
   ```

2. **Setup Backend**

   ```bash
   cd to-do-Backend
   npm install
   ```

3. **Setup Frontend**

   ```bash
   cd ../to-do-Front
   npm install
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd to-do-Backend
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

2. **Start the Frontend Development Server**

   ```bash
   cd to-do-Front
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

3. **Access API Documentation**
   Visit `http://localhost:3000/api-docs` for Swagger documentation

## 📖 API Endpoints

### Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### ToDo Lists

- `GET /api/todo` - Get all todo lists
- `POST /api/todo` - Create new todo list
- `PUT /api/todo/:id` - Update todo list
- `DELETE /api/todo/:id` - Delete todo list

### ToDo Items

- `GET /api/todo/items/:listId` - Get items in a list
- `POST /api/todo/items` - Create new todo item
- `PUT /api/todo/items/:id` - Update todo item
- `DELETE /api/todo/items/:id` - Delete todo item

## 🔔 Real-time Features

### Socket.IO Events

- **Connection Management**: User authentication and session handling
- **Task Reminders**: Automated notifications for upcoming due dates
- **Overdue Alerts**: Notifications for past-due tasks
- **Real-time Updates**: Live synchronization across multiple clients

### Notification System

- **Smart Timing**: Reminders sent 30, 15, 5 minutes before due date
- **Priority Levels**: Different notification styles based on urgency
- **Cron Jobs**: Server-side scheduling for reliable delivery

## 🎨 UI Components

The application uses a custom design system built with:

- **Shadcn/ui** components
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Responsive design** principles

### Key Components

- `TodoListComponent` - Main list display and management
- `AddTodoList` - List creation form
- `TodoItem` - Individual task component
- `AddTodo` - Task creation form
- `ProtectedRoute` - Authentication guard

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for secure password storage
- **Route Protection** - Frontend and backend route guards
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Server-side validation with Vine.js

## 🚀 Deployment

### Backend Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the `dist` folder with your preferred hosting service

## 📝 Scripts

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run swagger` - Generate API documentation

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

**Built with ❤️ using TypeScript, React, and Node.js**
