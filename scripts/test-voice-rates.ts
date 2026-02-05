import { getTierForNumber } from '../api/_utils/voice-rates';

const testCases = [
    { number: '+1 555 123 4567', expected: 'STANDARD' },
    { number: '+34 912 345 678', expected: 'STANDARD' },
    { number: '+34 612 345 678', expected: 'ULTRA' },
    { number: '+44 20 1234 5678', expected: 'STANDARD' },
    { number: '+44 7123 456789', expected: 'PREMIUM' },
    { number: '+44 800 123 4567', expected: 'BLOCKED' },
    { number: '+49 30 123456', expected: 'STANDARD' },
    { number: '+49 151 1234567', expected: 'ULTRA' },
    { number: '+54 11 1234 5678', expected: 'ULTRA' },
    { number: '+99 123 456 789', expected: 'BLOCKED' },
];

console.log('🧪 Testing Voice Tier Matching Logic...\n');

let successCount = 0;
for (const test of testCases) {
    const tier = getTierForNumber(test.number);
    const success = tier.id === test.expected;
    if (success) successCount++;

    console.log(`${success ? '✅' : '❌'} ${test.number.padEnd(20)} -> Expected: ${test.expected.padEnd(10)} Got: ${tier.id}`);
}

console.log(`\n📊 Result: ${successCount}/${testCases.length} passed.`);

if (successCount === testCases.length) {
    console.log('🚀 Logic is working correctly!');
    process.exit(0);
} else {
    console.log('⚠️ Some tests failed.');
    process.exit(1);
}
