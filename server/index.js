import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import postRoutes from "./routes/postRoutes.js";
import generatorRoutes from "./routes/generatorRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/post", postRoutes);
app.use("/api/v1/generator", generatorRoutes);

app.get("/", async (req, res) => {
    res.send("Hello from The Generator!");
});

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);

        app.listen(8080, () => {
            console.log(
                "Server has Started\nLocal:    http://localhost:8080 \nNetwork:  http://192.168.0.103:8080"
            );
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
