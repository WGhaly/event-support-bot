// Test badge generation locally
const { generateBadges } = require('./src/lib/badge-generator.ts');

// Sample data based on what should be in the database
const templateFields = [
  {
    id: 'field1',
    text: 'Name',
    x: 100,
    y: 100,
    width: 300,
    height: 50,
    fontSize: 97,
    fontFamily: 'Arial',
    fill: '#000000'
  },
  {
    id: 'field2',
    text: 'Title',
    x: 100,
    y: 200,
    width: 300,
    height: 40,
    fontSize: 34,
    fontFamily: 'Arial',
    fill: '#000000'
  }
];

const mappings = {
  field1: 'name',
  field2: 'title'
};

const dataRows = [
  {
    name: 'John Doe',
    title: 'Software Engineer',
    company: 'TechCorp',
    email: 'john.doe@example.com'
  }
];

console.log('Testing badge generation...');
console.log('Fields:', JSON.stringify(templateFields, null, 2));
console.log('Mappings:', JSON.stringify(mappings, null, 2));
console.log('Data:', JSON.stringify(dataRows[0], null, 2));

// Check mapping logic
for (const field of templateFields) {
  const columnName = mappings[field.id];
  console.log(`\nField ${field.id} (${field.text}) maps to column: ${columnName}`);
  if (columnName) {
    const value = dataRows[0][columnName];
    console.log(`  Value from row: ${value}`);
  } else {
    console.log('  NO MAPPING!');
  }
}
