import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, BookOpen, BarChart2 } from 'lucide-react';

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const categoryColors = {
  python: 'bg-blue-100 text-blue-700',
  web_dev: 'bg-purple-100 text-purple-700',
  devops: 'bg-orange-100 text-orange-700',
  data_science: 'bg-teal-100 text-teal-700',
  cloud: 'bg-sky-100 text-sky-700',
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.id}`} className="group block h-full">
      <div className="card h-full flex flex-col overflow-hidden group-hover:scale-[1.02] transition-transform duration-200">
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 h-36 flex items-end p-5 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[course.level] || 'bg-gray-100 text-gray-700'}`}>
              {course.level}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{course.title}</h3>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${categoryColors[course.category] || 'bg-gray-100 text-gray-700'}`}>
            {course.category?.replace('_', ' ')}
          </span>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-indigo-500" />
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={13} className="text-indigo-500" />
              <span>{course.lesson_count} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={13} className="text-indigo-500" />
              <span>{course.enrollment_count}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 truncate">
            <User size={11} className="inline mr-1" />{course.instructor_name}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
