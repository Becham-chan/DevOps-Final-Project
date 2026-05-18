import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await request('GET', '/api/enrollments/');
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.first_name || user?.username}!</h1>
        <p className="text-gray-600 mb-8">Continue learning and grow your skills</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 flex items-end p-4">
                  <BookOpen className="text-white mr-3" size={24} />
                  <h3 className="text-xl font-bold text-white">{enrollment.course_detail.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{enrollment.course_detail.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width:
