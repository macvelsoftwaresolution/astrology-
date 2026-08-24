<?php try { DB::table('marriage_matches')->insert(['boy_name' => 'test']); } catch (\Exception $e) { echo $e->getMessage(); }
