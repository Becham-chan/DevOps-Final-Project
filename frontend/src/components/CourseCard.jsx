import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, BookOpen, BarChart2 } from 'lucide-react';

const levelColors = {
  beginner: 'bg-emerald-50 text-emerald-700 border border-emerald-100/70',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-100/70',
  advanced: 'bg-rose-50 text-rose-700 border border-rose-100/70',
};

const categoryColors = {
  python: 'bg-sky-50 text-sky-700 border border-sky-100/70',
  web_dev: 'bg-violet-50 text-violet-700 border border-violet-100/70',
  devops: 'bg-indigo-50 text-indigo-700 border border-indigo-100/70',
  data_science: 'bg-teal-50 text-teal-700 border border-teal-100/70',
  cloud: 'bg-blue-50 text-blue-700 border border-blue-100/70',
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.id}`} className="group block h-full">
      <div className="card h-full flex flex-col overflow-hidden group-hover:scale-[1.02] group-hover:border-violet-200/50 transition-all duration-300">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-650 to-indigo-800 h-36 flex items-end p-5 relative overflow-hidden">
          {/* Decorative glowing background shape */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          
          <div className="absolute top-3.5 right-3.5">
            <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${levelColors[course.level] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              {course.level}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 z-10 font-display">{course.title}</h3>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col flex-1">
          <div className="mb-3">
            <span className={`text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full ${categoryColors[course.category] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              {course.category?.replace('_', ' ')}
            </span>
          </div>

          <p className="text-slate-500 text-sm mb-5 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>

          {/* Card Footer Details */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
              <Clock size={14} className="text-violet-500" />
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
              <BookOpen size={14} className="text-violet-500" />
              <span>{course.lesson_count} lessons</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
              <User size={14} className="text-violet-500" />
              <span>{course.enrollment_count}</span>
            </div>
          </div>

          <div className="text-[11px] font-medium text-slate-400 mt-4 pt-1 flex items-center gap-1 truncate">
            <User size={12} className="text-slate-300" />
            <span>Instructor: <span className="font-semibold text-slate-500">{course.instructor_name}</span></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
