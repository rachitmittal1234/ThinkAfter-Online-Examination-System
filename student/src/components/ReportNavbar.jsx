import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const tabs = [
  { name: 'Score Card', path: 'score' },
  { name: 'Subject Report', path: 'subject' },
  { name: 'Topic Report', path: 'topic' },
  { name: 'Question Report', path: 'question' },
];

const ReportNavbar = () => {
  const { reportId } = useParams();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm mt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 h-12 items-center justify-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/user/report/${reportId}/${tab.path}`}
              className={({ isActive }) =>
                `text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-700 hover:bg-blue-100'
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ReportNavbar;
