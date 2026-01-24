import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
