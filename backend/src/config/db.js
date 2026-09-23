const { Pool, types } = require('pg');

// O node-postgres, por padrao, converte a coluna DATE em um objeto Date do
// JS a meia-noite no fuso horario LOCAL do processo — o que pode empurrar a
// data para o dia anterior/seguinte dependendo do fuso do servidor. Como o
// resto da aplicacao trata datas como string "YYYY-MM-DD" (comparaveis
// lexicograficamente, ver utils/time.js), desativamos essa conversao aqui e
// mantemos a string crua que o Postgres devolve. OID 1082 = tipo "date".
types.setTypeParser(1082, (value) => value);

let pool = null;

/**
 * Pool de conexoes com o Postgres (Neon). So e criado (e so exige
 * DATABASE_URL) quando efetivamente usado — se a variavel nao estiver
 * definida, o app cai para o repositorio em memoria e este arquivo nunca
 * chega a ser exercitado.
 */
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL nao configurada.');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Exigido pela forma como o Neon termina TLS atras do proxy dele;
      // a conexao continua criptografada, so nao valida a cadeia de CA local.
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

module.exports = { getPool };
