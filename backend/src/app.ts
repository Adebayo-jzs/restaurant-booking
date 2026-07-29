import express,{Response, Request, NextFunction} from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const PORT = 8000;
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use("/api/auth", authRoutes);

// Global Error handler
app.use((err:Error, req:Request,res:Response, next:NextFunction) => {
    console.error('Unhandle error: ', err);
    res.status(500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
})

app.listen(PORT,()=> {console.log(`Server is up and running on port ${PORT}`)});

export default app;