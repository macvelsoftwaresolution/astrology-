<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * List all courses with syllabus modules and lessons
     */
    public function index()
    {
        $courses = DB::table('courses')->get()->map(function ($course) {
            $modules = DB::table('syllabus_modules')
                ->where('course_id', $course->id)
                ->orderBy('order_index')
                ->get()
                ->map(function ($module) {
                    $module->lessons = DB::table('lessons')
                        ->where('module_id', $module->id)
                        ->orderBy('order_index')
                        ->get();
                    return $module;
                });
            $course->modules = $modules;
            return $course;
        });

        return response()->json([
            'success' => true,
            'courses' => $courses
        ]);
    }

    /**
     * Create a new course
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'level' => 'required|string',
            'thumbnail' => 'nullable|string',
        ]);

        $courseId = DB::table('courses')->insertGetId([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'level' => $request->level,
            'thumbnail' => $request->thumbnail ?? 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=800',
            'status' => 'published',
            'created_by' => $request->user()->id ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully.',
            'course_id' => $courseId
        ]);
    }

    /**
     * Add Syllabus Module to Course
     */
    public function addModule(Request $request, $courseId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $moduleId = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => $request->title,
            'order_index' => DB::table('syllabus_modules')->where('course_id', $courseId)->count() + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Module added to syllabus.',
            'module_id' => $moduleId
        ]);
    }

    /**
     * Add Lesson (Audio, Video, PDF, Live Class Link) to Module
     */
    public function addLesson(Request $request, $moduleId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content_type' => 'required|in:video,audio,pdf,document,live_link',
            'content_url' => 'required|string',
            'duration' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $lessonId = DB::table('lessons')->insertGetId([
            'module_id' => $moduleId,
            'title' => $request->title,
            'content_type' => $request->content_type,
            'content_url' => $request->content_url,
            'duration' => $request->duration,
            'description' => $request->description,
            'order_index' => DB::table('lessons')->where('module_id', $moduleId)->count() + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson added successfully.',
            'lesson_id' => $lessonId
        ]);
    }

    /**
     * Delete Course
     */
    public function destroy($id)
    {
        DB::table('courses')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully.'
        ]);
    }
}
