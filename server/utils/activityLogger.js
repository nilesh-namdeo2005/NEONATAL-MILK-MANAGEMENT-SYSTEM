import ActivityLog from '../models/ActivityLog.js';

const logActivity = async (actor, action, entityType, entityId, details) => {
  try {
    await ActivityLog.create({
      actor,
      action,
      entityType,
      entityId,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export default logActivity;
