const { execSync } = require('child_process');

console.log(`🌱 Starting database deployment and seeding...`);

try {
  // Apply migrations
  console.log(`🔄 Applying database migrations...`);
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Generate Prisma Client
  console.log(`📦 Generating Prisma Client...`);
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log(`✅ Database deployment and seeding completed!`);
} catch (error) {
  console.error(`❌ Error during database deployment: ${error.message}`);
  process.exit(1);
}
