const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const ENCRYPTION_KEY = Buffer.from(
    (process.env.ENCRYPTION_KEY || 'default_32_char_key_change_me!!').substring(0, 32),
    'utf8'
);

const encryptData = (text) => {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        return text;
    }
};

const decryptData = (encryptedText) => {
    if (!encryptedText) return null;
    try {
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return encryptedText;
    }
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Encrypted API keys
    openaiApiKey: {
        type: String,
        default: null,
    },
    // Encrypted API keys
    groqaiApiKey: {
        type: String,
        default: null,
    },
    // User preferences
    preferredSourceLanguage: {
        type: String,
        default: 'auto',
    },
    preferredTargetLanguage: {
        type: String,
        default: 'en',
    },
    // Translation history reference
    translationCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

// Index for performance
userSchema.index({ email: 1, isActive: 1, createdAt: -1 });



// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

    } catch (error) {
        throw new Error("Password hashing failed error:", error);
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Set encrypted AI API key
userSchema.methods.setApiKey = function (key, provider) {
    if (provider === 'openai')
        this.openaiApiKey = encryptData(key);
    if (provider === 'groq')
        this.groqaiApiKey = encryptData(key);
};

// Get decrypted AI API key
userSchema.methods.getApiKey = function (provider) {
    if (provider === 'openai')
        return decryptData(this.openaiApiKey);
    if (provider === 'groq')
        return decryptData(this.groqaiApiKey);
    return null
};



// Return safe user object (no sensitive fields)
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        hasOpenApiKey: !!this.openaiApiKey,
        hasGroqApiKey: !!this.groqaiApiKey,
        preferredSourceLanguage: this.preferredSourceLanguage,
        preferredTargetLanguage: this.preferredTargetLanguage,
        translationCount: this.translationCount,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model('User', userSchema);