import { databases, storage } from './appwrite-client';

export const ChallengeService = {
  async getActiveChallenges(schoolId) {
    try {
      const challenges = await databases.listDocuments('challenges', [
        `equal('schoolId', '${schoolId}')`,
        `equal('status', 'active')`,
        `orderDesc('createdAt')`
      ]);
      return { success: true, data: challenges.documents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAllChallenges(schoolId) {
    try {
      const challenges = await databases.listDocuments('challenges', [
        `equal('schoolId', '${schoolId}')`
      ]);
      return { success: true, data: challenges.documents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getChallengeDetail(challengeId) {
    try {
      const challenge = await databases.getDocument('challenges', challengeId);
      return { success: true, data: challenge };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async submitChallenge(challengeId, submission) {
    try {
      // Call backend API to handle submission
      const response = await fetch('/api/v1/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ challengeId, ...submission })
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`);
      }

      return { success: true, data: await response.json() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSubmissions(studentId) {
    try {
      const submissions = await databases.listDocuments('submissions', [
        `equal('studentId', '${studentId}')`
      ]);
      return { success: true, data: submissions.documents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async uploadSubmissionPhoto(file, bucketId = 'challenge_photos') {
    try {
      const result = await storage.uploadFile(bucketId, file);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getChallengiesByCategory(schoolId, category) {
    try {
      const challenges = await databases.listDocuments('challenges', [
        `equal('schoolId', '${schoolId}')`,
        `equal('category', '${category}')`
      ]);
      return { success: true, data: challenges.documents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
