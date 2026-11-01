// Entry point: connect to MongoDB, create the optional admin account, start listening.
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const { hashPassword } = require('./services/authService');

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })) return;
  await User.create({ name: 'Admin', username: 'admin', email: ADMIN_EMAIL, password: await hashPassword(ADMIN_PASSWORD), role: 'admin', isVerified: true });
  console.log(`Admin account created: ${ADMIN_EMAIL}`);
};

const PORT = process.env.PORT || 5000;

connectDB()
  .then(seedAdmin)
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
