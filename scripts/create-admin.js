const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
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
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
    try {
        console.log('Connecting to MongoDB at:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to Database.');

        console.log('\n--- Create Admin User ---');

        const name = await question('Enter Admin Name: ');
        const email = await question('Enter Admin Email: ');
        const password = await question('Enter Admin Password: ');

        if (!name || !email || !password) {
            console.error('All fields are required.');
            process.exit(1);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('User with this email already exists.');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('\nAdmin user created successfully!');
        console.log(`Login with email: ${email}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        rl.close();
        process.exit(0);
    }
}

createAdmin();
