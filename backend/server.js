import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import testRouter from './routes/testRoute.js'
import questionRouter from './routes/questionRoute.js'
import reportRouter from './routes/reportRoute.js'
import postAnalysisRouter from './routes/postAnalysisRoute.js'
import contactRouter from './routes/contactRoute.js'
import anonymousMessageRouter from './routes/anonymousMessageRoute.js'
// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares 
app.use(express.json())
app.use(cors({origin:['https://think-after-online-examination-syst.vercel.app','http://localhost:5173','http://localhost:5174']
}))

// ✅ Add this line BELOW app.use(cors()) and app.use(express.json())
app.use('/uploads', express.static('uploads'));


// eyJhbGciOiJIUzI1NiJ9.YWRtaW5AZ21haWwuY29taGVsbG9hZG1pbg.JaB5h5oQ2CQ6d0_jt_8UbOt9nlIN8Pob0khVkqXztmY
// api endpoints

app.use('/api/user',userRouter)
app.use('/api', testRouter);

app.use('/api/questions', questionRouter);

app.use('/api/reports', reportRouter);

app.use('/api/post-analysis', postAnalysisRouter);

app.use('/api/contact', contactRouter);

app.use('/api/anonymous', anonymousMessageRouter);



app.get('/', (req,res)=>{
    res.send('API WORKING')
})

app.listen(port,()=> console.log('Server running on  PORT:' + port))