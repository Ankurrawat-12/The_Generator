import express from "express";
import * as dotenv from "dotenv";
import { OpenAI } from "openai";
import fetch from "node-fetch";

dotenv.config();

const router = express.Router();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.route("/").get((req, res) => {
    res.send("The Generator route API is Working!!");
});

router.route("/").post(async (req, res) => {
    const { prompt } = req.body;
    const encodedParams = new URLSearchParams();
    encodedParams.set("text", prompt);
    const url = "https://open-ai21.p.rapidapi.com/texttoimage2";
    const options = {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "X-RapidAPI-Key": process.env.X_RAPID_API_KEY,
            "X-RapidAPI-Host": "open-ai21.p.rapidapi.com",
        },
        body: encodedParams,
    };
    try {
        const response = await fetch(url, options);
        var result = await response.text();
        result = JSON.parse(result);
        console.log(result);
        console.log("Result URL :- " + result.url);
        var image = await fetchImageWithStatusCheck(result.url);
        console.log("Image URL :- " + image);

        res.status(200).json({ photo: image });
    } catch (error) {
        console.log(error);
        res.status(500).send(error || "An unknown error occurred");
    }
});

async function fetchImageWithStatusCheck(url) {
    let data;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();

                if (data.Status === "Processing") {
                    console.log(`Status: ${data.Status}, ETA: ${data.ETA}`);
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    return fetchImageWithStatusCheck(url);
                } else {
                    const imageUrl = data.url;
                    console.log("Returning the url of the image");
                    return fetchAndConvertImageToBase64(imageUrl);
                }
            } else {
                console.error("Response is not JSON.");
                console.log("Returning the url of the image");
                return fetchAndConvertImageToBase64(url);
            }
        }
    } catch (error) {
        console.error("Error fetching and processing image:", error);
        console.log("Returning null");
        return url;
    }
}

// async function fetchAndConvertImageToBase64(url) {
//     try {
//         const response = await fetch(url);
//         if (response.ok) {
//             const blob = await response.blob();
//             const reader = new FileReader();
//             return new Promise((resolve, reject) => {
//                 reader.onload = () => {
//                     const base64Image = reader.result;
//                     resolve(base64Image);
//                 };
//                 reader.onerror = reject;
//                 reader.readAsDataURL(blob);
//             });
//         }
//     } catch (error) {
//         console.error("Error fetching and converting image:", error);
//         return null;
//     }
// }

async function fetchAndConvertImageToBase64(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const buffer = await response.buffer();
            const base64Image = buffer.toString("base64");
            return base64Image;
        }
    } catch (error) {
        console.error("Error fetching and converting image:", error);
        return null;
    }
}

export default router;
