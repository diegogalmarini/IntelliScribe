
// Mocking the behavior to see what causes "(intermediate value).map is not a function"

const mockTranscribeAudio = async (scenario: string) => {
    switch (scenario) {
        case 'empty_object': return {};
        case 'object_with_segments_array': return { segments: [] };
        // case 'array': return []; // This would work fine with .map
    }
};

const runTest = async (scenario: string) => {
    console.log(`Testing scenario: ${scenario}`);
    try {
        const fullTranscription: any = await mockTranscribeAudio(scenario);

        // This is the ORIGINAL faulty code:
        const allSegments = fullTranscription.map((s: any) => s);

        console.log(`Success`);
    } catch (e: any) {
        console.log(`CAUGHT ERROR: ${e.message}`);
    }
};

(async () => {
    await runTest('empty_object');
    await runTest('object_with_segments_array');
})();
