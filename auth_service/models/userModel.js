const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

function isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username required'],
    },
    email: {
        type: String,
        required: [true, 'email required'],
        unique: true,
        validate: [isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, "password required"],
        minLength: [7, "password must be at least 7 characters"],
        maxLength: [15, "password cant be more than 15 characters"],
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(v);
            },
            message: props => `Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character`
        }
    },
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);    
    next();
});

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (user) {
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            return user
        };
        throw Error("incorrect password!")
    }

    throw Error("user isnt found");
}

const User = mongoose.model("user", userSchema);

module.exports = User;