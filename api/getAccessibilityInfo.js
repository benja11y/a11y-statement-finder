// pages/api/getAccessibilityInfo.js
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const initialResponse = await axios.get(url);
    const initialHtml = initialResponse.data;

    const $ = cheerio.load(initialHtml);
    const accessibilityLink = $("a")
      .filter(function () {
        return $(this).text().toLowerCase().includes("accessibility statement");
      })
      .attr("href");

    if (!accessibilityLink) {
      return res
        .status(404)
        .json({ error: "Accessibility statement link not found." });
    }
    const fullAccessibilityUrl = new URL(accessibilityLink, url).href;

    const accessibilityResponse = await axios.get(fullAccessibilityUrl);
    const accessibilityHtml = accessibilityResponse.data;
    const $accessibility = cheerio.load(accessibilityHtml);

    const dateRegex =
      /(Last updated|Last reviewed|Updated|Reviewed):\s*(.*?)(\.|<)/i;
    const dateMatch = $accessibility("body").text().match(dateRegex);
    let lastReviewedDate = null;

    if (dateMatch) {
      lastReviewedDate = dateMatch[2].trim();
    } else {
      const simplerDateRegex =
        /(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/g;
      const simplerDateMatch = $accessibility("body")
        .text()
        .match(simplerDateRegex);
      if (simplerDateMatch) {
        lastReviewedDate = simplerDateMatch[0];
      }
    }
    console.log("Data being sent:", {
      // Log the data before sending it
      accessibilityStatementUrl: fullAccessibilityUrl,
      lastReviewedDate: lastReviewedDate,
    });

    res.status(200).json({
      // Send the JSON response
      accessibilityStatementUrl: fullAccessibilityUrl,
      lastReviewedDate: lastReviewedDate,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    res.status(500).json({
      error: "An error occurred. Please check the URL and try again.",
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disabling body parser for this route if not needed
  },
};
