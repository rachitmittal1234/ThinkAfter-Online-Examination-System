import React from 'react'
import Navbar from './components/Navbar.jsx'
import { Routes, Route } from 'react-router-dom'
import { useState , useEffect } from 'react'
import Login from './components/Login.jsx'
import {ToastContainer , toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTest from './pages/AddTest.jsx'
import Sidebar from './components/Sidebar.jsx'
import AllTestsList from './pages/AllTestsList.jsx'
import TestQuestionsPage from './pages/TestQuestionsPage.jsx'
import EditQuestionPage from './pages/EditQuestionPage.jsx'
import AddQuestionPage from './pages/AddQuestionPage.jsx'
import AllQuestionsPage from './pages/AllQuestionsPage.jsx'
import AddNewQuestion from './pages/AddNewQuestion.jsx'
import AllUsersPage from './pages/AllUsersPage.jsx'
import ViewUserTest from './pages/ViewUserTest.jsx'
import ScorecardReport from './pages/ScoreCardReport.jsx'
import QuestionReportPage from './pages/QuestionReportPage.jsx'
import SubjectReportPage from './pages/SubjectReportPage.jsx'
import TopicReportPage from './pages/TopicReportPage.jsx'
import ViewUserQuestionResponsePage from './pages/ViewUserQuestionResponsePage.jsx'
import ViewAnalysisPage from './pages/ViewAnalysisPage.jsx'
import ViewAnalysisReport from './pages/ViewAnalysisReport.jsx'
import AdminContactMessagesPage from './pages/AdminContactMessagesPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'


export const backendUrl = import.meta.env.VITE_BACKEND_URL

const App = () => {

  const [token, settoken] = useState(localStorage.getItem('token') ? localStorage.getItem('token'):'');

  useEffect(() => {
    
  localStorage.setItem('token',token)
    
  }, [token])
  

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {token === ""
        ? <Login settoken = {settoken} /> :
        <>
          <Navbar settoken={settoken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/addtest' element={<AddTest token={token} />} />
                <Route path='/all-tests' element={<AllTestsList token={token} />} />
                <Route path='/all-questions' element={<AllQuestionsPage />} />
                <Route path="/admin/questions/add" element={<AddNewQuestion />} />

                <Route path="/admin/tests/:testId/questions" element={<TestQuestionsPage />} />
                <Route path="/admin/questions/:questionId/edit" element={<EditQuestionPage />} />
                <Route path="/admin/tests/:testId/questions/add" element={<AddQuestionPage />} />
                <Route path="/admin/users" element={<AllUsersPage />} />
                <Route path="/admin/user/tests/:userId" element={<ViewUserTest />} />
                <Route path="/admin/user/tests/:userId/:testId/scorecard" element={<ScorecardReport />} />
                <Route path="/admin/user/tests/:userId/:testId/question" element={<QuestionReportPage />} />
                <Route path="/admin/user/tests/:userId/:testId/subject" element={<SubjectReportPage />} />
                <Route path="/admin/user/tests/:userId/:testId/topic" element={<TopicReportPage />} />
                <Route path="/admin/user/tests/:userId/:testId/question/:questionId" element={<ViewUserQuestionResponsePage />} />
                <Route path="/admin/user/tests/:userId/:testId/analysis" element={<ViewAnalysisPage />} />
                <Route path="/admin/user/tests/:userId/:testId/analysis/report" element={<ViewAnalysisReport />} />
                <Route path="/admin/contact-messages" element={<AdminContactMessagesPage />} />
                <Route path="/admin/feedback" element={<FeedbackPage />} />


              </Routes>
            </div>
          </div>
        </>
      }

    </div>
  )
}

export default App