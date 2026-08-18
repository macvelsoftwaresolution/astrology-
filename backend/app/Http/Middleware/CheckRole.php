<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated access.'
            ], 401);
        }

        $allowedRoles = $roles;
        if (in_array('admin', $roles)) {
            $allowedRoles = array_merge($allowedRoles, ['super_admin', 'astrologer']);
        }

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Access Denied: You do not have permissions for this resource.',
                'role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
