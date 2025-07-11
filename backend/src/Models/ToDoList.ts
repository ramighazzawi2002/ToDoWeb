import mongoose from "mongoose";
const ToDoListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toDoItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToDoItem",
        required: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ToDoListModel = mongoose.model("ToDoList", ToDoListSchema);
export default ToDoListModel;
