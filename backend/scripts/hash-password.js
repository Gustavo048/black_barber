#!/usr/bin/env node
/**
 * Gera o hash bcrypt de uma senha para colocar em ADMIN_PASSWORD_HASH no .env.
 * Uso (dentro da pasta backend/): npm run hash-password -- "minha-senha-forte"
 */
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Uso: npm run hash-password -- "sua-senha"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nAdicione esta linha ao seu .env:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
