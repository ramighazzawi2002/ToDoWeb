import mongoose from "mongoose";
const ToDoItemSchema = new mongoose.Schema({
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
    toDoListId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToDoList",
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    dueDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });
const ToDoItemModel = mongoose.model("ToDoItem", ToDoItemSchema);
export default ToDoItemModel;
