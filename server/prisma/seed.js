const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.upsert({
    where: { id: "main-branch" },
    update: {},
    create: { id: "main-branch", name: "Main Branch", address: "Lagos, Nigeria" },
  });

  const hashedPassword = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@sorobanpos.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@sorobanpos.com",
      password: hashedPassword,
      role: "ADMIN",
      branchId: branch.id,
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  await prisma.product.upsert({
    where: { sku: "DEMO-001" },
    update: {},
    create: {
      name: "Demo Product",
      sku: "DEMO-001",
      price: 1000,
      costPrice: 600,
      categoryId: category.id,
      inventory: {
        create: { branchId: branch.id, quantity: 50, lowStock: 5 },
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
