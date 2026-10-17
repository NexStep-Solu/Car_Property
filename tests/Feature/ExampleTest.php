<?php

it('returns a successful response', function () {
    $response = $this->get('/');

    // Guest sees login directly at root
    $response->assertStatus(200);
});
