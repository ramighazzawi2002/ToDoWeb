import ToDoListModel from "../Models/ToDoList";
export const createToDoList = async (req, res) => {
    // #swagger.tags = ['ToDoList']
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'Create ToDo List.',
              schema: { $ref: '#/definitions/ToDoListCreateSchema' }
      } */
    try {
        const { title, description } = req.body;
        const newToDoList = new ToDoListModel({
            title,
            description,
            userId: req.user.id,
        });
        await newToDoList.save();
        res.status(201).json({
            message: "ToDo List created successfully",
            data: newToDoList,
        });
    }
    catch (error) {
        console.error("Create ToDo List error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
export const getToDoLists = async (req, res) => {
    // #swagger.tags = ['ToDoList']
    /*  #swagger.responses[200] = {
            description: 'ToDo Lists retrieved successfully',
            schema: { $ref: '#/definitions/ToDoListGetSchema' }
    } */
    try {
        const toDoLists = await ToDoListModel.find({
            userId: req.user.id,
            isDeleted: false,
        }).populate("toDoItems");
        if (!toDoLists || toDoLists.length === 0) {
            return res.status(404).json({
                message: "No ToDo Lists found for this user",
            });
        }
        res.status(200).json({
            message: "ToDo Lists retrieved successfully",
            data: toDoLists,
        });
    }
    catch (error) {
        console.error("Get ToDo Lists error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
export const updateToDoList = async (req, res) => {
    // #swagger.tags = ['ToDoList']
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'Update ToDo List.',
              schema: { $ref: '#/definitions/ToDoListUpdateSchema' }
      } */
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const updatedToDoList = await ToDoListModel.findByIdAndUpdate(id, { title, description }, { new: true, runValidators: true });
        if (!updatedToDoList) {
            return res.status(404).json({
                message: "ToDo List not found",
            });
        }
        res.status(200).json({
            message: "ToDo List updated successfully",
            data: updatedToDoList,
        });
    }
    catch (error) {
        console.error("Update ToDo List error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
export const deleteToDoList = async (req, res) => {
    // #swagger.tags = ['ToDoList']
    /*  #swagger.responses[200] = {
            description: 'ToDo List deleted successfully',
            schema: { $ref: '#/definitions/ToDoListDeleteSchema' }
    } */
    try {
        const { id } = req.params;
        const deletedToDoList = await ToDoListModel.findById(id);
        if (!deletedToDoList) {
            return res.status(404).json({
                message: "ToDo List not found",
            });
        }
        deletedToDoList.isDeleted = true;
        await deletedToDoList.save();
        res.status(200).json({
            message: "ToDo List deleted successfully",
            data: deletedToDoList,
        });
    }
    catch (error) {
        console.error("Delete ToDo List error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error : {},
        });
    }
};
