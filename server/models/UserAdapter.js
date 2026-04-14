/**
 * User Model Adapter
 * Automatically switches between MongoDB and Appwrite based on availability
 * 
 * Usage: const User = require('./models/UserAdapter');
 *        const user = await User.create({...});
 */

const mongoose = require('mongoose');
const AppwriteUserService = require('../services/appwriteUserService');

let MongooseUser = null;
let appwriteService = null;
let useAppwrite = false;

// Try to load Mongoose User model
try {
  MongooseUser = require('./User');
} catch (error) {
  console.warn('[UserAdapter] Could not load Mongoose User model:', error.message);
  useAppwrite = true;
}

// Initialize Appwrite service
try {
  appwriteService = new AppwriteUserService();
} catch (error) {
  console.error('[UserAdapter] Could not initialize Appwrite service:', error.message);
}

const UserAdapter = {
  // Statics (model methods)
  findOne: async (filter) => {
    try {
      // If MongoDB is available and user prefers it
      if (MongooseUser && !useAppwrite) {
        try {
          const result = await MongooseUser.findOne(filter);
          if (result) return result;
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB findOne failed, falling back to Appwrite:', dbError.message);
        }
      }

      // Fall back to Appwrite
      if (appwriteService) {
        if (filter.email) {
          return await appwriteService.findUserByEmail(filter.email);
        }
        if (filter._id) {
          return await appwriteService.findUserById(filter._id);
        }
        if (filter.id) {
          return await appwriteService.findUserById(filter.id);
        }
        if (filter.$or) {
          for (const clause of filter.$or) {
            if (clause.email) {
              const user = await appwriteService.findUserByEmail(clause.email);
              if (user) return user;
            }
            if (clause.phone || clause['profile.phone']) {
              const phone = clause.phone || clause['profile.phone'];
              const user = await appwriteService.findUserByPhone(phone);
              if (user) return user;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('[UserAdapter] findOne error:', error.message);
      throw error;
    }
  },

  find: async (filter = {}) => {
    try {
      // Try MongoDB first
      if (MongooseUser && !useAppwrite) {
        try {
          return await MongooseUser.find(filter);
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB find failed, falling back to Appwrite:', dbError.message);
        }
      }

      // Fall back to Appwrite
      if (appwriteService) {
        return await appwriteService.findUsers(filter);
      }
      return [];
    } catch (error) {
      console.error('[UserAdapter] find error:', error.message);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      // Check if ID looks like an email (contains @)
      // This handles old JWTs that used email as the ID
      const isEmail = id && id.includes('@');
      
      if (isEmail) {
        // If it looks like an email, find by email using findOne
        return await module.exports.findOne({ email: id });
      }

      // Try MongoDB first
      if (MongooseUser && !useAppwrite) {
        try {
          return await MongooseUser.findById(id);
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB findById failed, falling back to Appwrite:', dbError.message);
        }
      }

      // Fall back to Appwrite
      if (appwriteService) {
        return await appwriteService.findUserById(id);
      }
      return null;
    } catch (error) {
      console.error('[UserAdapter] findById error:', error.message);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      // If MongoDB is available, use it (better for full feature set)
      if (MongooseUser && !useAppwrite) {
        try {
          const user = await MongooseUser.create(userData);
          console.log('[UserAdapter] User created in MongoDB');
          return user;
        } catch (dbError) {
          // If creation fails due to connection, try Appwrite
          if (dbError.message.includes('connect') || dbError.message.includes('ECONNREFUSED')) {
            console.warn('[UserAdapter] MongoDB connection failed, falling back to Appwrite:', dbError.message);
            useAppwrite = true;
          } else {
            throw dbError;
          }
        }
      }

      // Use Appwrite
      if (appwriteService) {
        const user = await appwriteService.createUser(userData);
        console.log('[UserAdapter] User created in Appwrite:', user.email);
        return user;
      }

      throw new Error('No database backend available');
    } catch (error) {
      console.error('[UserAdapter] create error:', error.message);
      throw error;
    }
  },

  updateOne: async (filter, update) => {
    try {
      if (MongooseUser && !useAppwrite) {
        try {
          return await MongooseUser.updateOne(filter, update);
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB updateOne failed, falling back to Appwrite:', dbError.message);
        }
      }

      if (appwriteService) {
        const user = await appwriteService.findUserByEmail(filter.email || filter._id);
        if (user) {
          return await appwriteService.updateUser(user._id || user.id, update);
        }
      }
      return null;
    } catch (error) {
      console.error('[UserAdapter] updateOne error:', error.message);
      throw error;
    }
  },

  deleteOne: async (filter) => {
    try {
      if (MongooseUser && !useAppwrite) {
        try {
          return await MongooseUser.deleteOne(filter);
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB deleteOne failed, falling back to Appwrite:', dbError.message);
        }
      }

      if (appwriteService) {
        const user = await appwriteService.findUserByEmail(filter.email || filter._id);
        if (user) {
          return await appwriteService.deleteUser(user._id || user.id);
        }
      }
      return null;
    } catch (error) {
      console.error('[UserAdapter] deleteOne error:', error.message);
      throw error;
    }
  },

  countDocuments: async (filter = {}) => {
    try {
      if (MongooseUser && !useAppwrite) {
        try {
          return await MongooseUser.countDocuments(filter);
        } catch (dbError) {
          console.warn('[UserAdapter] MongoDB countDocuments failed, falling back to Appwrite:', dbError.message);
        }
      }

      if (appwriteService) {
        const users = await appwriteService.findUsers(filter, 10000);
        return users.length;
      }
      return 0;
    } catch (error) {
      console.error('[UserAdapter] countDocuments error:', error.message);
      throw error;
    }
  },

  select: (fields) => {
    // Mock select for compatibility
    return UserAdapter;
  },

  // Health check
  isConnected: async () => {
    if (MongooseUser && !useAppwrite) {
      try {
        const conn = mongoose.connection;
        return conn.readyState === 1; // Connected
      } catch {
        return false;
      }
    }
    return !!appwriteService;
  },

  getBackend: () => {
    if (appwriteService && (useAppwrite || !MongooseUser)) {
      return 'appwrite';
    }
    return 'mongodb';
  }
};

module.exports = UserAdapter;
