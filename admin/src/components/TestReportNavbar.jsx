import { NavLink, useParams } from 'react-router-dom';
import { FiBarChart2, FiBook, FiList, FiHelpCircle } from 'react-icons/fi';

const TestReportNavbar = () => {
  const { userId, testId } = useParams();

  const tabs = [
    { 
      name: 'Score Card', 
      path: 'scorecard',
      icon: <FiBarChart2 className="mr-2" />
    },
    { 
      name: 'Subject Report', 
      path: 'subject',
      icon: <FiBook className="mr-2" />
    },
    { 
      name: 'Topic Report', 
      path: 'topic',
      icon: <FiList className="mr-2" />
    },
    { 
      name: 'Question Report', 
      path: 'question',
      icon: <FiHelpCircle className="mr-2" />
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 h-12 items-center justify-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/admin/user/tests/${userId}/${testId}/${tab.path}`}
              className={({ isActive }) =>
                `text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-700 hover:bg-blue-100'
                }`
              }
            >
              {tab.icon}
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TestReportNavbar;