
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
if (!process.env.GEMINI_API_KEY) console.warn("⚠️ GEMINI_API_KEY is missing!");

module.exports = function () {
  const router = express.Router();

  // POST /api/chat
  router.post("/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let reply = "";
    const msgLower = message.toLowerCase();

    // Simple language detection: Bengali?
    const isBangla = /[\u0980-\u09FF]/.test(message);

    // ===============================
    // 🔥 ENGLISH INTENTS (Jhotpot)
    // ===============================
    if (!isBangla) {
      if (msgLower.includes("hi") || msgLower.includes("hello")) {
        reply = "Hello! 👋 Welcome to Jhotpot Parcel Service! How can I assist you today?";
      }

      else if (msgLower.includes("book") || msgLower.includes("parcel create")) {
        reply = "To book a parcel, please go to the Send a Parcel page . 📦";
      }

      else if (msgLower.includes("track") || msgLower.includes("tracking id")) {
        reply = "Please provide your Tracking ID. I will check the parcel status for you. 🔍";
      }

      else if (msgLower.includes("charge") || msgLower.includes("delivery fee")) {
        reply = "Delivery charge depends on weight, location & parcel type. Tell me weight + from + to. 💰";
      }

      else if (msgLower.includes("commission")) {
        reply = "Delivery agents can view their commission from their dashboard under 'My Commission'. 🚴💵";
      }

      else if (msgLower.includes("agent") || msgLower.includes("delivery man")) {
        reply = "For delivery agent info, please provide your parcel ID or agent ID. 👤";
      }

      else if (msgLower.includes("warehouse") || msgLower.includes("hub")) {
        reply = "Jhotpot has inter-city hubs and district-based warehouses. Tell me which district? 🏢";
      }

      else if (msgLower.includes("login") || msgLower.includes("signup")) {
        reply = "Please login or signup to access the Merchant, Admin, or Delivery Agent dashboard. 🔑";
      }

      // → Fallback to Gemini (English)
      else {
        try {
          const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a Jhotpot Parcel Management System assistant. 
Answer briefly in English. 
User asked: "${message}"`,
          });
          reply = response.text || "Glad to assist you with Jhotpot!";
        } catch (err) {
          console.error("Gemini Error:", err);
          reply = "I'm here to assist you with Jhotpot!";
        }
      }
    }

    // ===============================
    // 🔥 BENGALI INTENTS (Jhotpot)
    // ===============================
    else {
      if (msgLower.includes("হাই") || msgLower.includes("হ্যালো") || msgLower.includes("কেমন")) {
        reply = "হ্যালো! 👋 ঝটপট পার্সেল সার্ভিসে আপনাকে স্বাগতম! কিভাবে সাহায্য করতে পারি?";
      }

      else if (msgLower.includes("পার্সেল বুক") || msgLower.includes("বুকিং") || msgLower.includes("নতুন পার্সেল")) {
        reply = "পার্সেল বুক করতে Send a percel পেইজে এ যান। 📦";
      }

      else if (msgLower.includes("ট্র্যাক") || msgLower.includes("স্ট্যাটাস")) {
        reply = "অনুগ্রহ করে আপনার Tracking ID পাঠান, আমি স্ট্যাটাস চেক করে দিচ্ছি। 🔍";
      }

      else if (msgLower.includes("চার্জ") || msgLower.includes("ফি") || msgLower.includes("ডেলিভারি চার্জ")) {
        reply = "ডেলিভারি চার্জ ওজন, ধরন এবং লোকেশন অনুযায়ী নির্ধারিত হয়। ওজন + From + To জানান। 💰";
      }

      else if (msgLower.includes("কমিশন") || msgLower.includes("এজেন্ট কমিশন")) {
        reply = "ডেলিভারি এজেন্টরা তাদের কমিশন 'My Commission' সেকশন থেকে দেখতে পারবেন। 🚴💵";
      }

      else if (msgLower.includes("এজেন্ট") || msgLower.includes("ডেলিভারি ম্যান")) {
        reply = "এজেন্ট স্ট্যাটাস জানতে Parcel ID বা Agent ID দিন। 👤";
      }

      else if (msgLower.includes("গুদাম") || msgLower.includes("হাব") || msgLower.includes("ওয়্যারহাউস")) {
        reply = "ঝটপট-এর জেলা ভিত্তিক ওয়্যারহাউস ও ইন্টার-সিটি হাব রয়েছে। কোন জেলার তথ্য জানতে চান? 🏢";
      }

      else if (msgLower.includes("লগইন") || msgLower.includes("সাইনআপ")) {
        reply = "লেনদেন ও পার্সেল ম্যানেজমেন্ট করতে লগইন বা সাইনআপ করুন। 🔑";
      }

      // → Fallback to Gemini (Bangla)
      else {
        try {
          const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a Jhotpot Parcel Management System assistant. 
Answer briefly in Bengali. 
User asked: "${message}"`,
          });
          reply = response.text || "আমি ঝটপট নিয়ে সাহায্য করতে এখানে আছি!";
        } catch (err) {
          console.error("Gemini Error:", err);
          reply = "আমি ঝটপট নিয়ে সাহায্য করতে প্রস্তুত!";
        }
      }
    }

    res.json({ reply });
  });

  return router;
};
