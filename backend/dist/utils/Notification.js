import { io, userSockets } from "../index.js";
function sendNotificationToUser(userId, eventName, data) {
    console.log(`🔔 Attempting to send notification to user: ${userId}`);
    console.log(`📡 Event: ${eventName}`);
    console.log(`📦 Data:`, data);
    // Check if user has an active socket
    const socketId = userSockets.get(userId);
    console.log(`🔍 Socket ID for user ${userId}:`, socketId);
    console.log(`👥 All connected users:`, Array.from(userSockets.keys()));
    if (socketId) {
        // Method 1: Use personal room (recommended)
        console.log(`📢 Sending to room: user:${userId}`);
        io.to(`user:${userId}`).emit(eventName, data);
        // Don't use both methods - comment out Method 2
        // const socketId = userSockets.get(userId);
        // if (socketId) {
        //   io.to(socketId).emit(eventName, data);
        // }
        console.log(`✅ Notification sent successfully`);
    }
    else {
        console.log(`❌ User ${userId} not found in connected users`);
    }
}
export { sendNotificationToUser };
