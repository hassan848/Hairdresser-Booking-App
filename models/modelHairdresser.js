const mongoose = require("mongoose");

const hairdresserSchema = new mongoose.Schema(
  {
    location: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
    },
    proximity: Number,
    starRating: {
      type: Number,
      default: 0,
      min: [0, "Star Rating must be at least 0 or over"],
      max: [5, "Star Rating must be 5.0 or below"],

      set: (curRating) => Math.round(curRating * 10) / 10,
      // Performs the rounding calculation
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    genderMarket: {
      type: String,
      required: [true, "A hairdresser must specify its target gender market"],
      enum: {
        values: ["male", "female", "unisex"],
        messgae: "gender Market must be 1 from 3 of: male, female or unisex",
      },
    },
    workFlowDirection: {
      type: String,
      required: [
        true,
        "A hairdresser must specify the direction of workflow being either unidirectional or bidirectional",
      ],
      enum: {
        values: ["unidirectional", "bidirectional"],
        message: "Work flow must be either unidirectional or bidirectional",
      },
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    profileImg: { type: String, default: "original.jpg" },
    fullName: {
      type: String,
    },
    services: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Service",
      },
    ],
    servicesTitles: [
      {
        type: String,
      },
    ],
    homeAppointCost: {
      type: Number,
    },
    workSchedule: {
      mon: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      tue: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      wed: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      thu: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      fri: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      sat: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
      sun: {
        work_type: {
          type: String,
          enum: ["shop", "home", "dayoff"],
        },
        work_hours: String,
        slot_length: String,
        slot_gap: String,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hairdresserSchema.index({ location: "2dsphere" });

// Virtually populating the review on the hairdresser model
hairdresserSchema.virtual("review", {
  ref: "Review",
  foreignField: "hairdresser",
  localField: "_id",
});

hairdresserSchema.pre(/find/, function (next) {
  this.populate({
    path: "services",
    select: "-__v",
  });
  next();
});

const Hairdresser = mongoose.model("Hairdresser", hairdresserSchema);
module.exports = Hairdresser;
