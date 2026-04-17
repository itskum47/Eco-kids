import { databases, account } from './appwrite-client';

export const UserService = {
  async getProfile(userId) {
    try {
      const user = await databases.getDocument('users', userId);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateProfile(userId, data) {
    try {
      const updated = await databases.updateDocument('users', userId, data);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getEcoPoints(userId) {
    try {
      const points = await databases.listDocuments('eco_points', [
        `equal('studentId', '${userId}')`
      ]);
      return {
        success: true,
        data: points.documents && points.documents.length > 0
          ? points.documents[0]
          : {
              studentId: userId,
              totalPoints: 0,
              pointsThisWeek: 0,
              pointsThisMonth: 0,
              badges: [],
              lastUpdated: new Date().toISOString()
            }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateEcoPoints(userId, pointsData) {
    try {
      const existing = await databases.listDocuments('eco_points', [
        `equal('studentId', '${userId}')`
      ]);

      if (existing.documents && existing.documents.length > 0) {
        const updated = await databases.updateDocument(
          'eco_points',
          existing.documents[0].$id,
          pointsData
        );
        return { success: true, data: updated };
      } else {
        const created = await databases.createDocument('eco_points', {
          studentId: userId,
          ...pointsData,
          lastUpdated: new Date().toISOString()
        });
        return { success: true, data: created };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUsersBySchool(schoolId) {
    try {
      const users = await databases.listDocuments('users', [
        `equal('schoolId', '${schoolId}')`
      ]);
      return { success: true, data: users.documents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
