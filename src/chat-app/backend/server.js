import express from "express";
import authRoutes from './routes/auth.routes.js';


const PORT =  8000;

const app = express();


app.get('/',(req,res)=>
{
    res.send("Welcome to PORT 8000");
});

app.use('/api/auth',authRoutes);

app.listen(PORT,()=>
{
    console.log("Server is running in PORT",PORT);
})