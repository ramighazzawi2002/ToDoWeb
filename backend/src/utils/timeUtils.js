// Utility functions for time formatting and calculations
export const formatTimeRemaining = (minutes) => {
    if (minutes < 1) {
        return "أقل من دقيقة";
    }
    else if (minutes === 1) {
        return "دقيقة واحدة";
    }
    else if (minutes < 60) {
        return `${minutes} دقيقة`;
    }
    else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours === 1 && remainingMinutes === 0) {
            return "ساعة واحدة";
        }
        else if (hours === 1) {
            return `ساعة واحدة و ${remainingMinutes} دقيقة`;
        }
        else if (remainingMinutes === 0) {
            return `${hours} ساعات`;
        }
        else {
            return `${hours} ساعات و ${remainingMinutes} دقيقة`;
        }
    }
};
export const formatOverdueTime = (hours, minutes) => {
    if (hours === 0) {
        if (minutes === 1) {
            return "دقيقة واحدة";
        }
        else {
            return `${minutes} دقيقة`;
        }
    }
    else if (hours === 1) {
        if (minutes === 0) {
            return "ساعة واحدة";
        }
        else {
            return `ساعة واحدة و ${minutes} دقيقة`;
        }
    }
    else {
        if (minutes === 0) {
            return `${hours} ساعات`;
        }
        else {
            return `${hours} ساعات و ${minutes} دقيقة`;
        }
    }
};
export const getPriorityLevel = (minutesRemaining) => {
    if (minutesRemaining <= 0)
        return "critical";
    if (minutesRemaining <= 5)
        return "urgent";
    if (minutesRemaining <= 15)
        return "high";
    return "normal";
};
export const generateReminderMessage = (taskTitle, minutesRemaining) => {
    const timeString = formatTimeRemaining(minutesRemaining);
    if (minutesRemaining <= 5) {
        return `🚨 مهمة عاجلة: "${taskTitle}" متبقي لها ${timeString} فقط!`;
    }
    else if (minutesRemaining <= 15) {
        return `⏰ تذكير عاجل: مهمة "${taskTitle}" متبقي لها ${timeString}`;
    }
    else {
        return `📝 تذكير: لديك مهمة "${taskTitle}" متبقي لها ${timeString}`;
    }
};
