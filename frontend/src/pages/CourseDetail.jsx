import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { BookOpen, Clock, User, PlayCircle } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { request, loading } = useApi();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await request('GET', `/api/courses/${id}/`);
      setCourse(data);
      setLessons(data.lessons);
      if (data.lessons.length > 0) {
        setSelectedLesson(data.lessons[0]);
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {course.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{course.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock size={18} className="mr-2" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-semibold">{course.duration_hours} hours</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <User size={18} className="mr-2" />
                    <span className="text-sm">Instructor</span>
                  </div>
                  <p className="font-semibold">{course.instructor_name}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <BookOpen size={18} className="mr-2" />
                    <span className="text-sm">Level</span>
                  </div>
                  <p className="font-semibold capitalize">{course.level}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <PlayCircle size={18} className="mr-2" />
                    <span className="text-sm">Lessons</span>
                  </div>
                  <p className="font-semibold">{course.lesson_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-sm text-gray-600">{lesson.estimated_reading_time} min</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedLesson.title}</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Estimated reading time: {selectedLesson.estimated_reading_time} minutes
                </p>
                
                <div className="prose prose-sm max-w-none text-gray-700 mb-8">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <button className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    ← Previous
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Mark as Complete →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Select a lesson to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
``
