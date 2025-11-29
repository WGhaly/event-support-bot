require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkDomain() {
  try {
    console.log('🔍 Checking domain configuration...\n');
    
    const domains = await resend.domains.list();
    
    console.log('📋 Your domains:');
    for (const domain of domains.data) {
      console.log('\n  Domain:', domain.name);
      console.log('  Status:', domain.status);
      console.log('  Region:', domain.region);
      if (domain.records) {
        console.log('  DNS Records:');
        domain.records.forEach(r => {
          console.log(`    - ${r.record}: ${r.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDomain();
