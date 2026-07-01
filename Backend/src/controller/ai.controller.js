import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { cloudinary, uploadBufferToCloudinary } from "../config/cloudinary.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createGeminiCompletion = async ({
  prompt,
  maxTokens,
  temperature = 0.7,
  models = ["gemini-2.0-flash", "gemini-3.5-flash"],
}) => {
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await AI.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });
      } catch (error) {
        lastError = error;
        const status = error.status || error.response?.status;

        if (status !== 429 && status !== 503) {
          throw error;
        }

        if (attempt === 0) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
      }
    }
  }

  throw lastError;
};

//Generate Article Controller
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        succes: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const estimatedToken = Math.ceil(length * 4);

    const response = await createGeminiCompletion({
      prompt,
      maxTokens: estimatedToken,
      temperature: 0.2,
      models: ["gemini-2.0-flash", "gemini-3.5-flash"],
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    const status = error.status || error.response?.status;
    console.log(error.message);

    if (status === 429) {
      return res.json({
        success: false,
        message:
          "The AI service is temporarily rate-limiting requests. Please wait a moment and try again.",
      });
    }

    res.json({ success: false, message: error.message });
  }
};

//Generate Blog Title Controller
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        succes: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const aiPrompt = `Generate ONE catchy, SEO-friendly blog title for the following topic.
Topic: "${prompt}"

Rules:
- Return only one blog title.
- The title should be between 8 and 15 words.
- Make it engaging and clickable.
- Do not return explanations or bullet points.
`;


    const response = await createGeminiCompletion({
      prompt: aiPrompt,
      maxTokens: 100,
      temperature: 0.2,
      models: ["gemini-2.0-flash", "gemini-3.5-flash"],
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    const status = error.status || error.response?.status;
    console.log(error.message);

    if (status === 429) {
      return res.json({
        success: false,
        message:
          "The AI service is temporarily rate-limiting requests. Please wait a moment and try again.",
      });
    }

    res.json({ success: false, message: error.message });
  }
};

//Generate Image controller
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        succes: false,
        message: "This feature is only available for premium subscriptions",
      });
    }
    console.log("Plan:", req.plan);
    console.log("User:", req.auth());

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const imageBuffer = Buffer.from(data);
    console.log("Image generated from ClipDrop");
    console.log(`ClipDrop image buffer size: ${imageBuffer.length} bytes`);

    const uploadResult = await uploadBufferToCloudinary(imageBuffer, {
      folder: "clearsy-ai",
      overwrite: false,
    });
    const { secure_url } = uploadResult;

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false
      }) `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Complete Error:");
    console.error(error);

    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    res.json({ success: false, message: error.message });
  }
};

//Remove Image Background Controller
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image') `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Remove Image Object Controller
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image') `;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Review Resume Controller
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review') `;

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
