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
const allowedOrigins = [
  'https://think-after-online-examination-syst-silk.vercel.app',
  'https://think-after-online-examination-syst.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];
connectDB()
connectCloudinary()

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// middlewares 
app.use(express.json())


app.options('*', cors()); // allow preflight across all routes


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
