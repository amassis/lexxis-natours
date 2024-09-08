const crypto = require('crypto');
const mongoose = require('mongoose');
//const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'A first name is required.'],
      trim: true,
      maxlength: [20, 'A first name cannot have more than 20 chars'],
      minlength: [2, 'A first name cannot have less than 2 chars'],
      validate: {
        validator: function (v) {
          return validator.isAlpha(v, 'en-US', { ignore: ' -' });
        },
        message: 'A first name must contain only alphabetical chars.',
      },
    },
    familyName: {
      type: String,
      required: [true, 'A family name is required.'],
      trim: true,
      maxlength: [60, 'A family name cannot have more than 60 chars'],
      minlength: [2, 'A family name cannot have less than 2 chars'],
      validate: {
        validator: function (v) {
          return validator.isAlpha(v, 'en-US', { ignore: " -'" });
        },
        message:
          'A family name must contain only alphabetical chars, a dash or a quote.',
      },
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, 'An email is required.'],
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email address',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please, provide a password.'],
      minlength: [8, 'Please provide a password with at least 8 chars.'],
      select: false,
    },
    pwdConfirm: {
      type: String,
      required: [true, 'Please, confirm your password.'],
      validate: {
        // Only works on SAVE
        validator: function (v) {
          return v === this.password;
        },
        message: 'Passwords do not match.',
      },
    },
    pwdLastChangedAt: {
      type: Date,
    },
    pwdResetToken: {
      type: String,
    },
    pwdResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual('fullname').get(function () {
  return `${this.firstName} ${this.familyName}`;
});

userSchema.virtual('name').get(function () {
  return `${this.familyName}, ${this.firstName}`;
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.pwdConfirm = undefined;
  this.pwdLastChangedAt = Date.now() - 1000;
  next();
});

userSchema.post('save', function () {
  this.password = undefined;
  this.pwdConfirm = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.pwdLastChangedAt) {
    const pwdChangedTimeStamp = parseInt(
      this.pwdLastChangedAt.getTime() / 1000,
      10,
    );

    if (pwdChangedTimeStamp > JWTTimestamp) return true;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.pwdResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.pwdResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
