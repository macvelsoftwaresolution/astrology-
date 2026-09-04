<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_exam(): void
    {
        $user = User::factory()->create([
            'role' => 'user'
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/user/submissions', [
            'submission_type' => 'online_quiz',
            'score' => 85,
            'mcq_score' => 85,
            'notes' => 'Test quiz submission'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true
        ]);

        $this->assertDatabaseHas('student_submissions', [
            'student_id' => $user->id,
            'score' => 85
        ]);
    }

    public function test_guest_submission_handles_fallback_safely(): void
    {
        $response = $this->postJson('/api/user/submissions', [
            'submission_type' => 'online_quiz',
            'score' => 90,
            'mcq_score' => 90
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true
        ]);
    }
}
