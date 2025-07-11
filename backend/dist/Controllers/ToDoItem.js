import ToDoItemModel from "../Models/ToDoItem.js";
import ToDoListModel from "../Models/ToDoList.js";
import { CacheInvalidationService } from "../services/cacheInvalidationService.js";
const addToDoItem = async (req, res) => {
    // #swagger.tags = ['ToDoItem']
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'Add ToDo Item.',
              schema: { $ref: '#/definitions/ToDoItemCreateSchema' }
      } */
    try {
        const { title, description, dueDate } = req.body;
        const { id: toDoListId } = req.params; // Assuming toDoListId is passed as a URL parameter
        const newToDoItem = new ToDoItemModel({
            title,
            description,
            toDoListId,
            dueDate,
            userId: req.user.id, // Assuming user ID is stored in req.user
        });
        await newToDoItem.save();
        // Update the ToDo List to include this new item
        await ToDoListModel.findByIdAndUpdate(toDoListId, { $push: { toDoItems: newToDoItem._id } }, { new: true });
        // Invalidate cache after creating new task
        await CacheInvalidationService.afterTaskCreate(newToDoItem);
        res.status(201).json({
            message: "ToDo Item added successfully",
            data: newToDoItem,
        });
    }
    catch (error) {
        console.error("Add ToDo Item error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
const updateToDoItem = async (req, res) => {
    // #swagger.tags = ['ToDoItem']
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'Update ToDo Item.',
              schema: { $ref: '#/definitions/ToDoItemUpdateSchema' }
      } */
    try {
        const { id } = req.params;
        const { title, description, completed, dueDate } = req.body;
        const updatedToDoItem = await ToDoItemModel.findByIdAndUpdate(id, { title, description, completed, dueDate }, { new: true });
        if (!updatedToDoItem) {
            return res.status(404).json({
                message: "ToDo Item not found",
            });
        }
        // Invalidate cache after updating task
        await CacheInvalidationService.afterTaskUpdate(id, req.body);
        res.status(200).json({
            message: "ToDo Item updated successfully",
            data: updatedToDoItem,
        });
    }
    catch (error) {
        console.error("Update ToDo Item error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
const deleteToDoItem = async (req, res) => {
    // #swagger.tags = ['ToDoItem']
    try {
        const { id } = req.params;
        const deletedToDoItem = await ToDoItemModel.findById(id);
        if (!deletedToDoItem) {
            return res.status(404).json({
                message: "ToDo Item not found",
            });
        }
        deletedToDoItem.isDeleted = true;
        await deletedToDoItem.save();
        // Remove the item from the ToDo List
        await ToDoListModel.findByIdAndUpdate(deletedToDoItem.toDoListId, { $pull: { toDoItems: deletedToDoItem._id } }, { new: true });
        // Invalidate cache after deleting task
        await CacheInvalidationService.afterTaskDelete(id);
        res.status(200).json({
            message: "ToDo Item deleted successfully",
            data: deletedToDoItem,
        });
    }
    catch (error) {
        console.error("Delete ToDo Item error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
export { addToDoItem, updateToDoItem, deleteToDoItem };
