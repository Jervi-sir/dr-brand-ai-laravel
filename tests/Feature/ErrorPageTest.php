<?php

use Inertia\Testing\AssertableInertia as Assert;

it('returns the custom 404 error page', function () {
    $this->get('/non-existent-page')
        ->assertStatus(404)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('error')
                ->has('status')
                ->where('status', 404)
        );
});
