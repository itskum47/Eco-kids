const mongoose = require('mongoose');

const schoolTeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  teamType: {
    type: String,
    enum: ['class', 'house', 'club', 'custom'],
    default: 'class'
  },
  grade: {
    type: String // e.g., 'Class 5', 'Class 10'
  },
  description: {
    type: String,
    maxlength: 500
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'captain', 'vice_captain'],
      default: 'member'
    }
  }],
  coaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Teachers who mentor the team
  }],
  stats: {
    totalEcoPoints: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 },
    quizzesPassed: { type: Number, default: 0 },
    challengesWon: { type: Number, default: 0 },
    co2Prevented: { type: Number, default: 0 },
    treesPlanted: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
schoolTeamSchema.index({ school: 1, isActive: 1 });
schoolTeamSchema.index({ 'members.userId': 1 });
schoolTeamSchema.index({ 'stats.totalEcoPoints': -1 });

// Methods
schoolTeamSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.members.some(m => m.userId.equals(userId))) {
    this.members.push({ userId, role, joinedAt: new Date() });
  }
};

schoolTeamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => !m.userId.equals(userId));
};

schoolTeamSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  
  const memberIds = this.members.map(m => m.userId);
  const members = await User.find({ _id: { $in: memberIds }, isActive: true });
  
  let totalEcoPoints = 0;
  let activitiesCompleted = 0;
  let quizzesPassed = 0;
  let co2Prevented = 0;
  let treesPlanted = 0;
  
  members.forEach(member => {
    totalEcoPoints += member.gamification?.ecoPoints || 0;
    activitiesCompleted += member.environmentalImpact?.activitiesCompleted || 0;
    quizzesPassed += member.gamification?.badges?.length || 0;
    co2Prevented += member.environmentalImpact?.co2Prevented || 0;
    treesPlanted += member.environmentalImpact?.treesPlanted || 0;
  });
  
  this.stats = {
    totalEcoPoints,
    activitiesCompleted,
    quizzesPassed,
    challengesWon: this.stats.challengesWon || 0,
    co2Prevented,
    treesPlanted
  };
  
  await this.save();
};

// Static methods
schoolTeamSchema.statics.getSchoolTeams = function(schoolId) {
  return this.find({ school: schoolId, isActive: true })
    .populate('captain', 'name email')
    .populate('coaches', 'name email')
    .sort({ 'stats.totalEcoPoints': -1 })
    .lean();
};

schoolTeamSchema.statics.getTeamLeaderboard = function(limit = 50) {
  return this.find({ isActive: true })
    .populate('school', 'name')
    .sort({ 'stats.totalEcoPoints': -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('SchoolTeam', schoolTeamSchema);
