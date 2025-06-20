import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FiPieChart, FiMonitor, FiUsers } from 'react-icons/fi';

import analysis from '../images/analysisiamge.jpeg';
import onlineTest from '../images/onlinetest100.jpeg';
import mentorship from '../images/mentorshipimage.jpeg';

const features = [
  {
    title: 'Real Exam + Confidence Based Simulation',
    description:
      'Experience a test exactly like the actual exam — with a responsive timer, palette navigation, question review panel, and more. Plus, rate each question based on your confidence level: "Sure", "Partial", or "Guess". After the test, you’ll receive customized reports showing how confident you were versus how accurate you were.',
    icon: <FiMonitor className="text-indigo-600 text-3xl" />,
    image: onlineTest,
  },
  {
    title: 'In-Depth Smart Analysis',
    description:
      'We go beyond just scores. Get complete breakdowns of your performance: subject-wise, topic-wise, and even based on your confidence level. Identify your weak areas, track your accuracy under pressure, and make data-backed improvements with our AI-powered performance analytics.',
    icon: <FiPieChart className="text-indigo-600 text-3xl" />,
    image: analysis,
  },
  
  {
    title: 'Mentorship & Personalized Guidance',
    description:
      'Get access to expert mentors, live doubt-solving sessions, and one-on-one feedback. Based on your performance and behavioral patterns, we offer personalized study plans to help you improve faster. Support is always just a message away.',
    icon: <FiUsers className="text-indigo-600 text-3xl" />,
    image: mentorship,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Navbar />

        <div className="mt-10 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ThinkAfter !!</h1>
          <p className="text-gray-600 text-base">
            Practice smarter with analytics, confidence tracking, and real exam simulation.
          </p>
        </div>

        {/* Feature Cards - One per row */}
        <div className="space-y-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white shadow border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-shrink-0 w-full md:w-1/2">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="rounded-lg w-full h-56 object-cover shadow-sm"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-2">
            Start Practicing Smarter, Not Harder
          </h2>
          <p className="text-gray-600 mb-4">
            Join thousands of students and take your preparation to the next level.
          </p>
          <button
            onClick={() => navigate('/test')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
          >
            Start Your First Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
