const bcrypt = require('bcryptjs');
const userSchema = require("../schemas/user");
const { model } = require("mongoose")
userSchema.pre("save", async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirm_password = undefined
        if (!this.isNew) {
            this.passwordChangedAt = new Date() - 1000;
        }
    }
    next()
})

userSchema.methods.isCorrectPassword = (bodyPassword, hashPassword) => {
    return bcrypt.compare(bodyPassword, hashPassword)
}
userSchema.methods.isPasswordChangedAfter = function(timeStamp) {
    return new Date(this.passwordChangedAt) > new Date(timeStamp * 1000)
}
userSchema.methods.generateResetToken = function() {
    const expires_in_minutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN)
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.passwordResetTokenEAt = Date.now() + expires_in_minutes * (60 * 1000)
    return {
        token: resetToken,
        expires_in_minutes
    }
}

const User = model('User', userSchema)
module.exports = User