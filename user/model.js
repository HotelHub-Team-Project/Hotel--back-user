import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date },
    pendingEmail: { type: String },
    emailChangeCode: { type: String },
    emailChangeExpires: { type: Date },
    address: { type: String },
    dateOfBirth: { type: Date },
    avatarUrl: { type: String },
    coverUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.userId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.emailVerificationCode;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetCode;
    delete ret.passwordResetExpires;
    delete ret.emailChangeCode;
    delete ret.emailChangeExpires;
  },
});

export const User = mongoose.model("User", userSchema);
export default User;
