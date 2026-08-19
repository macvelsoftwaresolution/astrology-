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
        try {
            $courses = DB::table('courses')->orderBy('id', 'desc')->get();
            $courseIds = $courses->pluck('id')->filter();

            if ($courseIds->isNotEmpty()) {
                $modules = DB::table('syllabus_modules')
                    ->whereIn('course_id', $courseIds)
                    ->orderBy('order_index')
                    ->get();
                $moduleIds = $modules->pluck('id')->filter();

                $lessons = $moduleIds->isNotEmpty()
                    ? DB::table('lessons')
                        ->whereIn('module_id', $moduleIds)
                        ->orderBy('order_index')
                        ->get()
                        ->groupBy('module_id')
                    : collect();

                $modulesGrouped = $modules->map(function ($module) use ($lessons) {
                    $module->lessons = $lessons->get($module->id, collect())->values();
                    return $module;
                })->groupBy('course_id');

                $coursesFormatted = $courses->map(function ($course) use ($modulesGrouped) {
                    $course->modules = $modulesGrouped->get($course->id, collect())->values();
                    return $course;
                });
            } else {
                $coursesFormatted = collect();
            }

            return response()->json([
                'success' => true,
                'courses' => $coursesFormatted
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CourseController index error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'courses' => []
            ]);
        }
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

        if ($request->has('modules') && is_array($request->modules)) {
            foreach ($request->modules as $index => $mod) {
                $newModuleId = DB::table('syllabus_modules')->insertGetId([
                    'course_id' => $courseId,
                    'title' => $mod['title'] ?? 'Module',
                    'order_index' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if (isset($mod['lessons']) && is_array($mod['lessons'])) {
                    foreach ($mod['lessons'] as $lIndex => $les) {
                        DB::table('lessons')->insert([
                            'module_id' => $newModuleId,
                            'title' => $les['title'] ?? 'Lesson',
                            'content_type' => $les['content_type'] ?? 'video',
                            'content_url' => $les['content_url'] ?? '',
                            'duration' => $les['duration'] ?? null,
                            'description' => $les['description'] ?? null,
                            'order_index' => $lIndex + 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully.',
            'course_id' => $courseId
        ]);
    }

    /**
     * Update an existing course
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'level' => 'required|string',
            'thumbnail' => 'nullable|string',
        ]);

        DB::table('courses')->where('id', $id)->update([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'level' => $request->level,
            'thumbnail' => $request->thumbnail ?? 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=800',
            'updated_at' => now(),
        ]);

        if ($request->has('modules') && is_array($request->modules)) {
            // Delete old modules & lessons to recreate them
            $moduleIds = DB::table('syllabus_modules')->where('course_id', $id)->pluck('id');
            if ($moduleIds->isNotEmpty()) {
                DB::table('lessons')->whereIn('module_id', $moduleIds)->delete();
                DB::table('syllabus_modules')->where('course_id', $id)->delete();
            }

            foreach ($request->modules as $index => $mod) {
                $newModuleId = DB::table('syllabus_modules')->insertGetId([
                    'course_id' => $id,
                    'title' => $mod['title'] ?? 'Module',
                    'order_index' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if (isset($mod['lessons']) && is_array($mod['lessons'])) {
                    foreach ($mod['lessons'] as $lIndex => $les) {
                        DB::table('lessons')->insert([
                            'module_id' => $newModuleId,
                            'title' => $les['title'] ?? 'Lesson',
                            'content_type' => $les['content_type'] ?? 'video',
                            'content_url' => $les['content_url'] ?? '',
                            'duration' => $les['duration'] ?? null,
                            'description' => $les['description'] ?? null,
                            'order_index' => $lIndex + 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully.'
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
