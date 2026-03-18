const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
      enum: ['student', 'teacher', 'ngo_coordinator', 'school_admin', 'district_admin', 'state_admin', 'admin', 'faculty_advisor'],
    default: 'student',
    required: [true, 'Please provide a user role'],
    index: true
  },
  schoolCode: {
    type: String,
    trim: true,
    index: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'leaf'
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    trim: true,
    index: true
  },
  linkedStudentEmail: {
    type: String,
    trim: true
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date
    },
    grade: {
      type: String,
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'ug1', 'ug2', 'ug3', 'ug4']
    },
    school: {
      institutionType: {
        type: String,
        enum: ['school', 'college', 'university'],
        default: 'school',
        index: true
      },
      type: String,
      trim: true,
      index: true
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true
    },
    district: {
      type: String,
      trim: true,
      index: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true,
      index: true
    },
    language: {
      type: String,
      enum: ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi'],
      default: 'english'
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot be more than 200 characters']
    }
  },
  gamification: {
    ecoPoints: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      badgeId: String,
      name: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: Date
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  progress: {
    topicsCompleted: [{
      topicId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Topic'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number
    }],
    gamesPlayed: [{
      gameId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Game'
      },
      highScore: Number,
      timesPlayed: {
        type: Number,
        default: 1
      },
      lastPlayed: {
        type: Date,
        default: Date.now
      }
    }],
    experimentsCompleted: [{
      experimentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Experiment'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      photos: [String],
      notes: String
    }],
    quizzesTaken: [{
      quizId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Quiz'
      },
      score: Number,
      totalQuestions: Number,
      takenAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  ecoPointsTotal: {
    type: Number,
    default: 0,
    index: true
  },
  ecoCoins: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  environmentalImpact: {
    treesPlanted: {
      type: Number,
      default: 0,
      index: true
    },
    co2Prevented: {
      type: Number,
      default: 0
    },
    waterSaved: {
      type: Number,
      default: 0
    },
    plasticReduced: {
      type: Number,
      default: 0
    },
    energySaved: {
      type: Number,
      default: 0
    },
    activitiesCompleted: {
      type: Number,
      default: 0,
      index: true
    },
    lastImpactUpdate: {
      type: Date,
      default: Date.now
    }
  },
  impactBaseline: {
    co2: {
      type: Number,
      default: 0
    },
    water: {
      type: Number,
      default: 0
    },
    plastic: {
      type: Number,
      default: 0
    },
    energy: {
      type: Number,
      default: 0
    },
    trees: {
      type: Number,
      default: 0
    },
    sourceSurvey: {
      showerDuration: Number,
      transportMode: {
        type: String,
        enum: ['car', 'bus', 'bike', 'walk', 'other']
      },
      meatDaysPerWeek: {
        type: Number,
        min: 0,
        max: 7
      },
      waterUsagePerDay: Number
    },
    createdAt: Date,
    updatedAt: Date
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      achievements: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showProgress: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  hashedRefreshToken: {
    type: String,
    select: false
  },
    refreshTokenExpire: Date,
  
    // Parental consent fields (DPDP Act 2023 - Section 1B)
    parentName: {
      type: String,
      trim: true
    },
    parentEmail: {
      type: String,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
        'Please provide a valid parent email'
      ]
    },
    parentPhone: {
      type: String,
      trim: true
    },
    parentConsentGiven: {
      type: Boolean,
      default: false
    },
    parentConsentDate: {
      type: Date
    },
    parentConsentToken: {
      type: String,
      select: false
      },
  
      // Account deletion fields (DPDP Act 2023 - Section 1C)
      deletionScheduled: {
        type: Boolean,
        default: false
      },
      deletionDate: {
        type: Date
      },
      deletionBackup: {
        type: String,
        select: false
    }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's age
UserSchema.virtual('age').get(function () {
  if (!this.profile.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for current level info
UserSchema.virtual('levelInfo').get(function () {
  const points = this.gamification.ecoPoints;
  const level = Math.floor(points / 100) + 1;
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const progressToNextLevel = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;

  return {
    currentLevel: level,
    pointsForCurrentLevel,
    pointsForNextLevel,
    progressToNextLevel: Math.round(progressToNextLevel)
  };
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Soft-delete pattern: exclude isActive: false by default
UserSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({
    isActive: { $ne: false },
    deletedAt: { $exists: false }
  });
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (expiresIn = process.env.ACCESS_TOKEN_EXPIRE || process.env.JWT_EXPIRE || '15m') {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add EcoPoints and update level
UserSchema.methods.addEcoPoints = function (points) {
  this.gamification.ecoPoints += points;
  this.gamification.level = Math.floor(this.gamification.ecoPoints / 100) + 1;
  return this.save();
};

// Award badge
UserSchema.methods.awardBadge = function (badgeId, badgeName) {
  const existingBadge = this.gamification.badges.find(badge => badge.badgeId === badgeId);
  if (!existingBadge) {
    this.gamification.badges.push({
      badgeId,
      name: badgeName,
      earnedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Update environmental impact
UserSchema.methods.updateEnvironmentalImpact = function (impactData) {
  if (impactData.treesPlanted) {
    this.environmentalImpact.treesPlanted += impactData.treesPlanted;
  }
  if (impactData.co2Prevented) {
    this.environmentalImpact.co2Prevented += impactData.co2Prevented;
  }
  if (impactData.waterSaved) {
    this.environmentalImpact.waterSaved += impactData.waterSaved;
  }
  if (impactData.plasticReduced) {
    this.environmentalImpact.plasticReduced += impactData.plasticReduced;
  }
  if (impactData.energySaved) {
    this.environmentalImpact.energySaved += impactData.energySaved;
  }
  if (impactData.activitiesCompleted) {
    this.environmentalImpact.activitiesCompleted += impactData.activitiesCompleted;
  }
  this.environmentalImpact.lastImpactUpdate = new Date();
  return this.save();
};

// Update streak
UserSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastActivity = this.gamification.streak.lastActivity;

  if (!lastActivity) {
    // First activity
    this.gamification.streak.current = 1;
    this.gamification.streak.longest = 1;
  } else {
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.gamification.streak.current += 1;
      if (this.gamification.streak.current > this.gamification.streak.longest) {
        this.gamification.streak.longest = this.gamification.streak.current;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.gamification.streak.current = 1;
    }
    // If daysDiff === 0, same day, no change needed
  }

  this.gamification.streak.lastActivity = today;
  return this.save();
};

// Compound indexes for leaderboard scalability
UserSchema.index({ role: 1, isActive: 1, 'profile.school': 1 });
UserSchema.index({ role: 1, isActive: 1, 'profile.district': 1 });
UserSchema.index({ role: 1, isActive: 1, 'profile.state': 1 });
UserSchema.index({ 'gamification.ecoPoints': -1 });
UserSchema.index({ 'gamification.level': -1 });
UserSchema.index({ 'environmentalImpact.co2Prevented': -1 });

// Phase 3B Performance Indexes
UserSchema.index({ "profile.school": 1, role: 1, active: 1 });
UserSchema.index({ "profile.school": 1, "environmentalImpact.co2Prevented": -1 });

// === Phase 3C multi-tenant performance hooks ===
UserSchema.index({ "profile.state": 1, role: 1, active: 1 });
UserSchema.index({ "profile.state": 1, "profile.district": 1, role: 1, active: 1 });
UserSchema.index({ "profile.state": 1, "profile.district": 1, "profile.school": 1 });

UserSchema.index({
  role: 1,
  "gamification.ecoPoints": -1
});

module.exports = mongoose.model('User', UserSchema);