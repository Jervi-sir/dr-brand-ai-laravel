<?php

use App\Ai\Agents\SplitScriptGenerator;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Mockery;

test('split script generator schema is valid', function () {
    $agent = new SplitScriptGenerator(
        userPrompt: 'Test',
        topicPrompt: 'Test',
        contentIdea: 'Test',
        hookType: 'Test',
        hookPrompts: 'Test'
    );

    $jsonSchema = Mockery::mock(JsonSchema::class);
    $arraySchema = Mockery::mock();
    $objectSchema = Mockery::mock();
    $stringSchema = Mockery::mock();

    $jsonSchema->shouldReceive('array')->andReturn($arraySchema);
    $arraySchema->shouldReceive('items')->andReturn($arraySchema);
    $arraySchema->shouldReceive('required')->andReturn($arraySchema);

    $jsonSchema->shouldReceive('object')->andReturn($objectSchema);
    $jsonSchema->shouldReceive('string')->andReturn($stringSchema);
    $stringSchema->shouldReceive('required')->andReturn($stringSchema);

    $schema = $agent->schema($jsonSchema);

    expect($schema)->toHaveKey('scripts');
});
