import crypto from 'crypto';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '..', '.env.local') });

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + process.env.ADMIN_PASSWORD_SALT)
    .digest('hex');
}

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  process.exit(1);
}

console.log('Hashed password:', hashPassword(password));
