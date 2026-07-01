import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();
    if (!message) {
      return Response.json({ reply: "How can I assist you today?" }, { status: 400 });
    }

    const query = message.toLowerCase();
    const products = await prisma.product.findMany();
    
    let matchedProducts = [...products];
    let reply = "I found some beautiful pieces you might love! Take a look:";

    // Basic AI Intent Matching
    let isSpecific = false;

    // 1. Category Matching
    if (query.includes("necklace") || query.includes("chain")) {
      matchedProducts = matchedProducts.filter(p => p.category.toLowerCase().includes("necklace"));
      reply = "Our necklaces are crafted with the utmost elegance. Here are my top recommendations for you:";
      isSpecific = true;
    } else if (query.includes("earring")) {
      matchedProducts = matchedProducts.filter(p => p.category.toLowerCase().includes("earring"));
      reply = "Earrings frame the face beautifully. Let me show you some stunning options:";
      isSpecific = true;
    } else if (query.includes("ring")) {
      matchedProducts = matchedProducts.filter(p => p.category.toLowerCase().includes("ring"));
      reply = "Rings are a perfect statement piece. How about these gorgeous designs?";
      isSpecific = true;
    } else if (query.includes("bracelet") || query.includes("bangle")) {
      matchedProducts = matchedProducts.filter(p => p.category.toLowerCase().includes("bracelet") || p.category.toLowerCase().includes("bangle"));
      reply = "A beautiful bracelet adds the perfect touch to the wrist. I think you'll love these:";
      isSpecific = true;
    } else if (query.includes("bridal") || query.includes("wedding")) {
      matchedProducts = matchedProducts.filter(p => p.category.toLowerCase().includes("bridal") || (p.badge && p.badge.toLowerCase().includes("bridal")));
      reply = "Congratulations! 💍 Our bridal collection is designed for the modern royalty. Here is what I suggest for your special day:";
      isSpecific = true;
    }

    // 2. Budget Matching
    const budgetMatch = query.match(/under (\d+)/) || query.match(/(\d+) budget/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      matchedProducts = matchedProducts.filter(p => p.price <= budget);
      reply = `I completely understand. Here are some breathtaking pieces under ₹${budget}:`;
      isSpecific = true;
    }

    // 3. Gift Matching
    if (query.includes("gift") || query.includes("present") || query.includes("wife") || query.includes("girlfriend") || query.includes("mom") || query.includes("mother")) {
      reply = "What a thoughtful idea! 🎁 Jewelry is the ultimate gift of love. I've handpicked these pieces that make perfect, unforgettable gifts:";
      isSpecific = true;
    }

    // 4. Greeting & Chat
    if (query.match(/^(hi|hello|hey|greetings|sup)$/i) || query.includes("how are you")) {
      reply = "Hello there! ✧ I'm the Marbie Assistant. Tell me what you're looking for, or who you're shopping for, and I'll find the perfect match.";
      matchedProducts = [];
    } 
    // 5. Jewelry Care
    else if (query.includes("clean") || query.includes("care") || query.includes("wash") || query.includes("tarnish")) {
      reply = "To keep your Marbie jewelry shining, gently wipe it with a soft cloth after use and store it in a dry place. Avoid direct contact with perfumes and harsh chemicals! Let me know if you want to browse our latest pieces.";
      matchedProducts = [];
    }
    else if (!isSpecific) {
      // Out of domain / Weird questions
      const weirdKeywords = ["meaning of life", "weather", "politics", "president", "joke", "funny", "weird", "kill", "die", "stupid", "dumb", "idiot", "who are you", "robot", "ai"];
      const isWeird = weirdKeywords.some(w => query.includes(w)) || (query.split(" ").length > 8 && matchedProducts.length === 0);

      // General fallback search
      matchedProducts = matchedProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );

      if (isWeird) {
        reply = "I might not have all the answers to life's mysteries, but I'm an expert at styling! ✨ Let's focus on finding you the perfect piece of jewelry. Are you looking for a gift, or something for yourself?";
        matchedProducts = [];
      } else if (matchedProducts.length > 0) {
        reply = "I searched our royal vaults and found these matching pieces just for you:";
      } else {
        reply = "Hmm, I couldn't find exactly what you described in our current collection. Could you tell me a bit more? For example, you can say 'gold rings' or 'gifts under 5000'.";
      }
    }

    // Limit to top 4 recommendations to keep chat clean
    const recommendedProducts = matchedProducts.slice(0, 4);

    return Response.json({
      reply,
      products: recommendedProducts
    });

  } catch (error) {
    console.error("Wingman API Error:", error);
    return Response.json({ reply: "I seem to have lost my connection to the royal vault. Please try again in a moment." }, { status: 500 });
  }
}
