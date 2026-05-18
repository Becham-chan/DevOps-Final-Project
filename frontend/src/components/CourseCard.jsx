import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 flex items-end p-4">
          <h3 className="text-xl font-bold text-white">{course.title}</h3>
        </div>

        <div className="p-6">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-3 font-semibold">
            {course.category}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{course.duration_hours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{course.lesson_count} lessons</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              course.level === 'beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.level}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
``
