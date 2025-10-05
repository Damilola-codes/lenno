// scripts/db-health-check.ts
import { checkDatabaseConnection } from '@/library/db-connection';

async function healthCheck() {
  console.log('🔍 Checking database health...');
  
  const result = await checkDatabaseConnection();
  
  if (result.status === 'healthy') {
    console.log('✅ Database is healthy!');
    console.log(`📊 ${result.message}`);
    process.exit(0);
  } else {
    console.log('❌ Database is unhealthy!');
    console.log(`💥 ${result.message}`);
    process.exit(1);
  }
}

healthCheck().catch(console.error);