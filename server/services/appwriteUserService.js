const { Client, Databases, Query, ID } = require('node-appwrite');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const appwriteConfig = require('../config/appwrite-config');

class AppwriteUserService {
  constructor() {
    this.client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.apiKey);

    this.databases = new Databases(this.client);
    this.databaseId = appwriteConfig.databaseId;
    this.collectionId = appwriteConfig.collections.users;
  }

  /**
   * Hash password using bcrypt-like logic
   */
  async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a new user in Appwrite
   */
  async createUser(userData) {
    try {
      const {
        name,
        email,
        password,
        role = 'student',
        profile = {}
      } = userData;

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create document in Appwrite FIRST to get the UUID
      const userId = ID.unique();

      // Generate JWT token methods - use the Appwrite UUID as ID, not email
      const getSignedJwtToken = (ttl = '15m') => {
        return jwt.sign(
          { id: userId, email, role },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: ttl }
        );
      };

      const matchPassword = async (enteredPassword) => {
        return this.comparePassword(enteredPassword, hashedPassword);
      };
      const userDoc = await this.databases.createDocument(
        this.databaseId,
        this.collectionId,
        userId,
        {
          fullName: name,
          email,
          password: hashedPassword,
          role,
          isActive: true,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Add methods to returned object
      const userWithMethods = {
        ...userDoc,
        _id: userId,
        id: userId,
        getSignedJwtToken,
        matchPassword,
        save: async () => {
          // Mock save for compatibility
          return this;
        }
      };

      console.log('✅ User created successfully in Appwrite:', {
        userId,
        email,
        name
      });
      return userWithMethods;
    } catch (error) {
      console.error('❌ Error creating user in Appwrite:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    try {
      const result = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('email', email.toLowerCase())]
      );

      if (result.documents.length === 0) {
        return null;
      }

      const userDoc = result.documents[0];
      return this.attachMethods(userDoc);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId) {
    try {
      const userDoc = await this.databases.getDocument(
        this.databaseId,
        this.collectionId,
        userId
      );

      return this.attachMethods(userDoc);
    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by phone with multiple field variations
   */
  async findUserByPhone(phone) {
    try {
      const normalizedPhone = phone.toString().replace(/\D/g, '').replace(/^91/, '');

      // Try to find by any phone field variation
      const results = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.search('phone', normalizedPhone)]
      );

      if (results.documents.length === 0) {
        return null;
      }

      return this.attachMethods(results.documents[0]);
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    try {
      const userDoc = await this.databases.updateDocument(
        this.databaseId,
        this.collectionId,
        userId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );

      return this.attachMethods(userDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Save user (update operation)
   */
  async saveUser(userId, userData) {
    return this.updateUser(userId, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        userId
      );
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Parse profile JSON
   */
  parseProfile(profileJson) {
    try {
      return typeof profileJson === 'string' ? JSON.parse(profileJson) : profileJson;
    } catch {
      return {};
    }
  }

  /**
   * Parse gamification JSON
   */
  parseGamification(gamificationJson) {
    try {
      return typeof gamificationJson === 'string' ? JSON.parse(gamificationJson) : gamificationJson;
    } catch {
      return {};
    }
  }

  /**
   * Attach methods to user document for compatibility with Mongoose
   */
  attachMethods(userDoc) {
    const getSignedJwtToken = (ttl = '15m') => {
      return jwt.sign(
        { id: userDoc.email, role: userDoc.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: ttl }
      );
    };

    const matchPassword = async (enteredPassword) => {
      return this.comparePassword(enteredPassword, userDoc.password);
    };

    const profile = this.parseProfile(userDoc.profile);
    const gamification = this.parseGamification(userDoc.gamification);

    return {
      ...userDoc,
      _id: userDoc.$id || userDoc.id,
      id: userDoc.$id || userDoc.id,
      profile,
      gamification,
      ecoCoins: userDoc.ecoCoins || 0,
      lastLogin: userDoc.lastLogin ? new Date(userDoc.lastLogin) : null,
      getSignedJwtToken,
      matchPassword,
      save: async () => {
        return this.attachMethods(
          await this.updateUser(userDoc.$id || userDoc.id, userDoc)
        );
      }
    };
  }

  /**
   * Find users with filter (for admin queries)
   */
  async findUsers(filters = {}, limit = 100) {
    try {
      const queries = [];
      if (filters.role) {
        queries.push(Query.equal('role', filters.role));
      }
      if (filters.isActive !== undefined) {
        queries.push(Query.equal('isActive', filters.isActive));
      }

      const results = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [...queries, Query.limit(limit)]
      );

      return results.documents.map(doc => this.attachMethods(doc));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }
}

module.exports = AppwriteUserService;
