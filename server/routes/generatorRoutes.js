import express from "express";
import * as dotenv from "dotenv";
import { OpenAI } from "openai";

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
        console.log("Calling the fetchImageWithStatusCheck function");
        var image = await fetchImageWithStatusCheck(result.url);
        console.log("Called the fetchImageWithStatusCheck function");
        console.log("Image URL :- " + image);

        res.status(200).json({ photo: image });
    } catch (error) {
        console.log(error);
        res.status(500).send(error || "An unknown error occurred");
    }
});

async function fetchImageWithStatusCheck(url) {
    try {
        console.log("fetching the response");
        const response = await fetch(url);
        console.log("fetched the response " + response);

        if (response.ok) {
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log("About to check the status code.");

                if (data.Status === "Processing") {
                    console.log(`Status: ${data.Status}, ETA: ${data.ETA}`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return fetchImageWithStatusCheck(url); // Return the result of the recursive call
                } else {
                    const imageUrl = data.url;
                    console.log("Returning the url of the image");
                    return imageUrl;
                }
            } else {
                console.error("Response is not JSON.");
                return null;
            }
        }
    } catch (error) {
        console.error("Error fetching and processing image:", error);
        console.log("Returning null");
        return null;
    }
}


export default router;
