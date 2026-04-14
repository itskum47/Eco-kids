const AppwriteUserService = require('./appwriteUserService');

const service = new AppwriteUserService();

// Export a User-like object that mimics Mongoose model interface
const User = {
  // Statics (model methods)
  findOne: async (filter) => {
    if (filter.email) {
      return service.findUserByEmail(filter.email);
    }
    if (filter._id) {
      return service.findUserById(filter._id);
    }
    if (filter.id) {
      return service.findUserById(filter.id);
    }
    if (filter.phone) {
      return service.findUserByPhone(filter.phone);
    }
    // Handle $or queries for phone variations
    if (filter.$or) {
      const emailVariant = filter.$or.find(f => f.email);
      if (emailVariant) return service.findUserByEmail(emailVariant.email);
      const phoneVariant = filter.$or.find(f => f.phone);
      if (phoneVariant) return service.findUserByPhone(phoneVariant.phone);
    }
    return null;
  },

  find: async (filter) => {
    return service.findUsers(filter);
  },

  findById: async (id) => {
    return service.findUserById(id);
  },

  create: async (userData) => {
    return service.createUser(userData);
  },

  updateOne: async (filter, update) => {
    const user = await User.findOne(filter);
    if (!user) return null;
    return service.updateUser(user._id || user.id, update);
  },

  deleteOne: async (filter) => {
    const user = await User.findOne(filter);
    if (!user) return null;
    return service.deleteUser(user._id || user.id);
  },

  countDocuments: async (filter = {}) => {
    const users = await service.findUsers(filter, 10000);
    return users.length;
  },

  select: (fields) => {
    // Mock select for compatibility
    return User;
  }
};

module.exports = User;
