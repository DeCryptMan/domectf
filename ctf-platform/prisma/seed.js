const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs'); // Убедись, что bcryptjs установлен
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Planting seeds...');

  // 1. Чистим базу
  await prisma.solve.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // 2. Создаем ROOT ADMIN
  const passwordHash = await hash('admin123', 10); // ПАРОЛЬ: admin123
  
  await prisma.user.create({
    data: {
      username: 'root',
      email: 'root@cyberdome.ctf',
      passwordHash,
      role: 'ADMIN' // <--- ВАЖНО: Роль админа
    }
  });

  console.log('✅ ADMIN CREATED: Login with root / admin123');
  
  // ... (Твой код с задачами можно оставить ниже)
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });