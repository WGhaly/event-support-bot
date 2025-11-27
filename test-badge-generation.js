// Quick test to check what's happening with badge generation
const fetch = require('node-fetch');

async function testExport() {
  const exportUrl = 'https://thelujproject.vercel.app/api/exports/cmii0c6u300012vukzwpzzx8u';
  const manifestUrl = 'https://7hxlnnedz4sp1zmo.public.blob.vercel-storage.com/badges/cmii0c6u300012vukzwpzzx8u/manifest-cfxha0nN7i5qdI4RDDIuyI1p81giKZ.json';
  
  console.log('Fetching manifest...');
  const manifestRes = await fetch(manifestUrl);
  const manifest = await manifestRes.json();
  console.log('Manifest:', JSON.stringify(manifest, null, 2));
}

testExport().catch(console.error);
