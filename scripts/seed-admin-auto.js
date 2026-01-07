const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read environment variables manually from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let mongoUri = 'mongodb://localhost:27017/attendance-system';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const match = envConfig.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) {
        mongoUri = match[1].trim();
    }
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to Database.');

        const email = 'admin@system.com';
        const password = 'admin';
        const name = 'System Admin';

        // Check if exists, if so, update password or notify
        let user = await User.findOne({ email });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            console.log('Admin user already exists. Updating password...');
            user.password = hashedPassword;
            user.role = 'admin'; // Ensure role is admin
            await user.save();
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'admin'
            });
        }

        console.log('SUCCESS');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedAdmin();
