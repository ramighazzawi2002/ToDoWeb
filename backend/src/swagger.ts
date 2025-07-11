import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";
dotenv.config();
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
const doc = {
  info: {
    title: "To-Do Backend API",
    description:
      "A comprehensive API for managing to-do lists and user authentication",
    version: "1.0.0",
  },
  host:
    process.env.NODE_ENV === "production"
      ? "todoweb-i27o.onrender.com"
      : "localhost:3000",
  definition: {
    /**
     *   firstName: vine.string().trim().minLength(2).maxLength(50),
       lastName: vine.string().trim().minLength(2).maxLength(50),
       email: vine.string().email().normalizeEmail(),
       password: vine.string().minLength(6).maxLength(100),
     */
    UserSignUpSchema: {
      firstName: {
        type: "string",
        description: "User's first name",
        example: "John",
      },
      lastName: {
        type: "string",
        description: "User's last name",
        example: "Doe",
      },
      email: {
        type: "string",
        description: "User's email address",
        example: "john.doe@example.com",
      },
      password: {
        type: "string",
        description: "User's password",
        example: "password123",
      },
    },
    UserSignInSchema: {
      email: {
        type: "string",
        description: "User's email address",
        example: "john.doe@example.com",
      },
      password: {
        type: "string",
        description: "User's password",
        example: "password123",
      },
    },
    ToDoListCreateSchema: {
      title: {
        type: "string",
        description: "Title of the ToDo List",
        example: "Grocery Shopping",
      },
      description: {
        type: "string",
        description: "Description of the ToDo List",
        example: "Buy groceries for the week",
      },
    },
    ToDoListUpdateSchema: {
      title: {
        type: "string",
        description: "Updated title of the ToDo List",
        example: "Weekly Grocery Shopping",
      },
      description: {
        type: "string",
        description: "Updated description of the ToDo List",
        example: "Buy groceries and household items for the week",
      },
    },
    ToDoListDeleteSchema: {
      id: {
        type: "string",
        description: "ID of the ToDo List to delete",
        example: "60c72b2f9b1e8e001c8f8c8f",
      },
    },
    ToDoListGetSchema: {
      _id: {
        type: "string",
        description: "Unique identifier of the ToDo List",
        example: "60c72b2f9b1e8e001c8f8c8f",
      },
      title: {
        type: "string",
        description: "Title of the ToDo List",
        example: "Weekly Grocery Shopping",
      },
      description: {
        type: "string",
        description: "Description of the ToDo List",
        example: "Buy groceries and household items for the week",
      },
      userId: {
        type: "string",
        description: "ID of the user who owns this ToDo List",
        example: "60c72b1f9b1e8e001c8f8c8a",
      },
      ToDoLists: {
        type: "array",
        description: "Array of ToDo items in this list",
        items: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier of the ToDo Item",
              example: "60c72b3f9b1e8e001c8f8c90",
            },
            title: {
              type: "string",
              description: "Title of the ToDo Item",
              example: "Buy milk",
            },
            description: {
              type: "string",
              description: "Description of the ToDo Item",
              example: "Get 2% milk from the dairy section",
            },
            completed: {
              type: "boolean",
              description: "Whether the ToDo Item is completed",
              example: false,
            },
            isDeleted: {
              type: "boolean",
              description: "Whether the ToDo Item is deleted",
              example: false,
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Due date for the ToDo Item",
              example: "2023-06-14T10:30:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "When the ToDo Item was created",
              example: "2023-06-14T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "When the ToDo Item was last updated",
              example: "2023-06-14T10:30:00.000Z",
            },
          },
        },
        example: [
          {
            _id: "60c72b3f9b1e8e001c8f8c90",
            title: "Buy milk",
            description: "Get 2% milk from the dairy section",
            completed: false,
            isDeleted: false,
            createdAt: "2023-06-14T10:30:00.000Z",
            updatedAt: "2023-06-14T10:30:00.000Z",
          },
          {
            _id: "60c72b3f9b1e8e001c8f8c91",
            title: "Buy bread",
            description: "Whole wheat bread from the bakery",
            completed: true,
            isDeleted: false,
            createdAt: "2023-06-14T10:31:00.000Z",
            updatedAt: "2023-06-14T11:45:00.000Z",
          },
          {
            _id: "60c72b3f9b1e8e001c8f8c92",
            title: "Buy eggs",
            description: "One dozen free-range eggs",
            completed: false,
            isDeleted: false,
            createdAt: "2023-06-14T10:32:00.000Z",
            updatedAt: "2023-06-14T10:32:00.000Z",
          },
        ],
      },
      isDeleted: {
        type: "boolean",
        description: "Whether the ToDo List is deleted",
        example: false,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "When the ToDo List was created",
        example: "2023-06-14T10:00:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "When the ToDo List was last updated",
        example: "2023-06-14T11:45:00.000Z",
      },
    },
    ToDoItemCreateSchema: {
      title: {
        type: "string",
        description: "Title of the ToDo Item",
        example: "Buy milk",
      },
      description: {
        type: "string",
        description: "Description of the ToDo Item",
        example: "Get 2% milk from the dairy section",
      },
      toDoListId: {
        type: "string",
        description: "ID of the ToDo List this item belongs to",
        example: "60c72b2f9b1e8e001c8f8c8f",
      },
    },
    ToDoItemUpdateSchema: {
      title: {
        type: "string",
        description: "Updated title of the ToDo Item",
        example: "Buy almond milk",
      },
      description: {
        type: "string",
        description: "Updated description of the ToDo Item",
        example: "Get unsweetened almond milk from the dairy section",
      },
      completed: {
        type: "boolean",
        description: "Whether the ToDo Item is completed",
        example: true,
      },
    },
    ToDoItemDeleteSchema: {
      id: {
        type: "string",
        description: "ID of the ToDo Item to delete",
        example: "60c72b3f9b1e8e001c8f8c90",
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const routes = ["./src/index.ts"];

swaggerAutogen()(outputFile, routes, doc);
