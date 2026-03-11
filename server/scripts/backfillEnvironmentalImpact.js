const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const backfill = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const result = await User.updateMany(
      { environmentalImpact: { $exists: false } },
      {
        $set: {
          environmentalImpact: {
            treesPlanted: 0,
            co2Prevented: 0,
            waterSaved: 0,
            plasticReduced: 0,
            energySaved: 0,
            activitiesCompleted: 0
          }
        }
      }
    );

    console.log(`Fixed ${result.modifiedCount} users`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

backfill();
