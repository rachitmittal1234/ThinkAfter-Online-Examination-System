import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Login from './pages/Login'
// import Navbar from './components/Navbar'
import Home from './pages/Home'
import Test from './pages/Test'
import Reports from './pages/Reports'
import Contact from './pages/Contact'
import TestInstruction from './pages/TestInstruction'
import TestPage from './pages/TestPage'
import QuestionPage from './pages/QuestionPage'
import SummaryPage from './pages/SummaryPage'
import TestReviewPage from './pages/TestReviewPage'
import ScoreCard from './pages/Report/ScoreCard'
import SubjectReport from './pages/Report/SubjectReport'
import TopicReport from './pages/Report/TopicReport'
import QuestionReport from './pages/Report/QuestionReport'
import ViewQuestionResponse from './pages/Report/ViewQuestionResponse'
import AnalysisList from './pages/AnalysisList'
import DoAnalysisPage from './pages/DoAnalysisPage'
import AnalysisReportPage from './pages/AnalysisReport'
import ProfilePage from './pages/ProfilePage'
import FeedbackPage from './pages/FeedbackPage'


export const backendUrl = import.meta.env.VITE_BACKEND_URL

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path = '/test' element={<Test/>}/>
        <Route path='/report' element={<Reports/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/analysis' element={<AnalysisList/>}/>

        <Route path="/instructions/:testId" element={<TestInstruction />} />
        <Route path="/start-test/:testId" element={<TestPage />} />
        <Route path="/start-test/:testId/:questionIndex" element={<QuestionPage />} />
        <Route path="/summary/:testId" element={<SummaryPage />} />
        <Route path="/test-review/:testId" element={<TestReviewPage />} />
        <Route path="/user/report/:reportId/score" element={<ScoreCard />} />
        <Route path="/user/report/:reportId/subject" element={<SubjectReport />} />
        <Route path="/user/report/:reportId/topic" element={<TopicReport />} />
        <Route path="/user/report/:reportId/question" element={<QuestionReport />} />
        <Route path="/view-question-response/:questionId" element={<ViewQuestionResponse />} />
        <Route path="/analysis/:testId/do" element={<DoAnalysisPage />} />
        <Route path="/user/analysis-report/:testId" element={<AnalysisReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />


        




      </Routes>
      {/* hii , rachit here */}
    </div>
  )
}

export default App
