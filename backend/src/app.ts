import express,{Response, Request, NextFunction} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/authRoutes';
import restaurantRoutes from './routes/restaurant.route';
import bookingRoutes from './routes/booking.route';
import { swaggerSpec } from './swagger';
import cookieParser from 'cookie-parser';
// import basicAuth from 'express-basic-auth';

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Swagger Docs – JSON spec is always available
app.get('/openapi.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Swagger UI – only in non-production (swagger-ui-dist uses __dirname, which is unavailable in CF Workers)
if (process.env.NODE_ENV !== 'production') {
    import('swagger-ui-express').then((swaggerUi) => {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    });
}

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/bookings", bookingRoutes);

// Global Error handler
app.use((err:Error, req:Request,res:Response, next:NextFunction) => {
    console.error('Unhandle error: ', err);
    res.status(500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
})

export default app;