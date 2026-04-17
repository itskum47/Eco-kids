import { Client, Databases, ID } from 'node-appwrite';

/**
 * Appwrite Cloud Function: Create User Profile
 * Triggered on user registration
 * Creates: profile + eco_points + audit_log
 */

export default async (req, res) => {
  try {
    // Initialize Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const dbId = process.env.APPWRITE_DATABASE_ID || 'ecokids_main';

    // Extract user data from request
    const { userId, email, fullName, role, schoolId } = JSON.parse(req.payload);

    console.log(`[create-user-profile] Processing user: ${email}`);

    // 1. Create user document in users collection (if not exists)
    try {
      const userDoc = await databases.getDocument(dbId, 'users', userId);
      console.log(`[create-user-profile] User already exists: ${userId}`);
    } catch (error) {
      if (error.code === 404) {
        // User doesn't exist, create it
        await databases.createDocument(
          dbId,
          'users',
          userId,
          {
            email,
            fullName,
            role,
            schoolId,
            isActive: true,
            mfaEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        console.log(`[create-user-profile] User profile created: ${userId}`);
      } else {
        throw error;
      }
    }

    // 2. Create eco_points record
    try {
      await databases.createDocument(
        dbId,
        'eco_points',
        ID.unique(),
        {
          studentId: userId,
          schoolId: schoolId || 'unknown',
          totalPoints: 0,
          pointsThisWeek: 0,
          pointsThisMonth: 0,
          badges: JSON.stringify([]),
          lastUpdated: new Date().toISOString()
        }
      );
      console.log(`[create-user-profile] Eco-points record created for: ${userId}`);
    } catch (error) {
      console.warn(`[create-user-profile] Eco-points creation warning:`, error.message);
    }

    // 3. Create audit log entry
    try {
      await databases.createDocument(
        dbId,
        'audit_logs',
        ID.unique(),
        {
          userId,
          action: 'user_registered',
          actionType: 'registration',
          status: 'success',
          details: JSON.stringify({
            email,
            role,
            schoolId,
            timestamp: new Date().toISOString()
          }),
          timestamp: new Date().toISOString()
        }
      );
      console.log(`[create-user-profile] Audit log created for: ${userId}`);
    } catch (error) {
      console.warn(`[create-user-profile] Audit log warning:`, error.message);
    }

    // Success response
    return res.json({
      success: true,
      message: 'User profile created successfully',
      userId,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[create-user-profile] Error:', error.message);
    
    return res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
};
