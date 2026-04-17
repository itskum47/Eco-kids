import { Client, Databases, ID, Query } from 'node-appwrite';

/**
 * Appwrite Cloud Function: Award Challenge Points
 * Triggered when challenge submission is approved
 * Updates: eco_points, badges, leaderboards
 */

export default async (req, res) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const dbId = process.env.APPWRITE_DATABASE_ID || 'ecokids_main';

    // Extract submission data
    const { submissionId, studentId, challengeId, basePoints, bonusPoints, schoolId } = 
      JSON.parse(req.payload);

    console.log(`[award-points] Processing submission: ${submissionId}`);

    // Calculate total points
    const totalPointsAwarded = (basePoints || 0) + (bonusPoints || 0);

    // 1. Update eco_points record
    try {
      const ecoPointRecords = await databases.listDocuments(
        dbId,
        'eco_points',
        [
          Query.equal('studentId', studentId),
          Query.equal('schoolId', schoolId || 'unknown')
        ]
      );

      if (ecoPointRecords.documents.length > 0) {
        const ecoPointDoc = ecoPointRecords.documents[0];
        const currentTotal = ecoPointDoc.totalPoints || 0;
        const newTotal = currentTotal + totalPointsAwarded;

        await databases.updateDocument(
          dbId,
          'eco_points',
          ecoPointDoc.$id,
          {
            totalPoints: newTotal,
            pointsThisWeek: (ecoPointDoc.pointsThisWeek || 0) + totalPointsAwarded,
            pointsThisMonth: (ecoPointDoc.pointsThisMonth || 0) + totalPointsAwarded,
            lastUpdated: new Date().toISOString()
          }
        );

        console.log(`[award-points] Updated eco_points for ${studentId}: +${totalPointsAwarded}`);

        // 2. Check badge eligibility
        await checkBadgeEligibility(databases, dbId, studentId, schoolId, newTotal);

        // 3. Update leaderboard
        await updateLeaderboard(databases, dbId, studentId, schoolId, newTotal);

        // 4. Create audit log
        await databases.createDocument(
          dbId,
          'audit_logs',
          ID.unique(),
          {
            userId: studentId,
            action: 'challenge_completed',
            actionType: 'points_awarded',
            status: 'success',
            details: JSON.stringify({
              submissionId,
              challengeId,
              basePoints,
              bonusPoints,
              totalAwarded: totalPointsAwarded,
              newTotal
            }),
            timestamp: new Date().toISOString()
          }
        );

        return res.json({
          success: true,
          message: 'Points awarded successfully',
          pointsAwarded: totalPointsAwarded,
          newTotal,
          studentId,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(`No eco_points record found for ${studentId}`);
      }

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('[award-points] Error:', error.message);
    
    return res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
};

/**
 * Check if student has earned any new badges
 */
async function checkBadgeEligibility(databases, dbId, studentId, schoolId, totalPoints) {
  try {
    const badgeMilestones = {
      50: 'eco_warrior_bronze',
      100: 'eco_warrior_silver',
      250: 'eco_warrior_gold',
      500: 'environmental_champion'
    };

    let newBadges = [];

    for (const [points, badgeId] of Object.entries(badgeMilestones)) {
      if (totalPoints >= parseInt(points)) {
        newBadges.push(badgeId);
      }
    }

    if (newBadges.length > 0) {
      console.log(`[award-points] New badges earned: ${newBadges.join(', ')}`);
    }

    return newBadges;

  } catch (error) {
    console.warn('[award-points] Badge check warning:', error.message);
    return [];
  }
}

/**
 * Update leaderboard standings
 */
async function updateLeaderboard(databases, dbId, studentId, schoolId, totalPoints) {
  try {
    const periods = ['weekly', 'monthly', 'alltime'];

    for (const period of periods) {
      const leaderboardRecords = await databases.listDocuments(
        dbId,
        'leaderboards',
        [
          Query.equal('schoolId', schoolId || 'unknown'),
          Query.equal('period', period),
          Query.equal('studentId', studentId)
        ]
      );

      if (leaderboardRecords.documents.length > 0) {
        // Update existing leaderboard entry
        const entry = leaderboardRecords.documents[0];
        await databases.updateDocument(
          dbId,
          'leaderboards',
          entry.$id,
          { points: totalPoints, updatedAt: new Date().toISOString() }
        );
      } else {
        // Create new leaderboard entry
        await databases.createDocument(
          dbId,
          'leaderboards',
          ID.unique(),
          {
            schoolId: schoolId || 'unknown',
            period,
            studentId,
            rank: 0,
            points: totalPoints,
            updatedAt: new Date().toISOString()
          }
        );
      }
    }

    console.log(`[award-points] Leaderboard updated for ${studentId}`);

  } catch (error) {
    console.warn('[award-points] Leaderboard update warning:', error.message);
  }
}
