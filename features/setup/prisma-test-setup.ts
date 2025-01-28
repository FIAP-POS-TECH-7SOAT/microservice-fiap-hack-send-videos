import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaId: string): string {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'A variável de ambiente DATABASE_URL precisa ser configurada.',
    );
  }
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId); // Define o schema para o banco isolado
  return url.toString();
}

const schemaId = randomUUID(); // Gera um ID único para o schema

// Executado antes de todos os testes
export async function setupTestDatabase() {
  const databaseURL = generateUniqueDatabaseURL(schemaId);
  process.env.DATABASE_URL = databaseURL;

  // Executa a sincronização do banco (como migrations)
  execSync('npx prisma db push', {
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
    },
  });

  console.log(`Banco de dados de teste criado com schema: ${schemaId}`);
  return {
    DATABASE_URL: databaseURL,
  };
}

// Executado após todos os testes
export async function teardownTestDatabase() {
  // Dropa o schema criado para testes
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();

  console.log(`Schema de teste "${schemaId}" foi removido.`);
}
