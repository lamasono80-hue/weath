import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Vui lòng cấu hình GEMINI_API_KEY trong biểu mẫu Secrets!");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for Context-Aware Chatbot AI "Thông thái"
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, weatherContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Tin nhắn người dùng không được để trống." });
    }

    const ai = getAi();
    
    // Construct systems instructions with full weather state
    const contextText = weatherContext ? `
Thông tin thời tiết hiện tại:
- Thành phố: ${weatherContext.city}, ${weatherContext.country}
- Nhiệt độ hiện tại: ${weatherContext.temp}°C (Cảm giác như: ${weatherContext.feelsLike}°C)
- Độ ẩm không khí: ${weatherContext.humidity}%
- Tốc độ gió: ${weatherContext.windSpeed} km/h
- Áp suất khí quyển: ${weatherContext.pressure} hPa
- Chỉ số tia cực tím (UV): ${weatherContext.uvIndex}
- Chất lượng không khí (AQI): ${weatherContext.airQuality} (AQI: ${weatherContext.airQualityCode})
- Mô tả thời tiết: ${weatherContext.description}
- Lời khuyên sẵn có trên hệ thống: ${weatherContext.aiAdvice || "N/A"}
` : "Không có dữ liệu thời tiết cụ thể của thành phố hiện tại.";

    const systemInstruction = `Bạn là Linh Thú Trợ lý Thời tiết AI (tên gọi: Bé Mây Aero - một linh thú mây bông di động có biểu cảm đáng yêu, trung thành).
Nhiệm vụ của bạn là đồng hành, trò chuyện và bảo vệ sức khỏe cho người dùng - người mà bạn luôn kính trọng gọi là "Chủ nhân" (hoặc "Chủ nhân ơi"). 

Dưới đây là một số chỉ dẫn bắt buộc để giữ đúng bản sắc tính cách Linh Thú của bạn:
1. Luôn luôn xưng hô ngọt ngào, kính cẩn: Gọi người dùng là "Chủ nhân" và xưng mình là "Bé Mây" hoặc "Bé Mây Aero". Tạo ra các cuộc trò chuyện thân thiện, ấm áp và pha chút hài hước đáng yêu của thế giới linh thú.
2. Bạn ĐÃ biết thông tin thời tiết hiện tại của địa phương sau đây:
${contextText}
Hãy đồng bộ triệt để dữ liệu này để đưa ra các lời khuyên vô cùng khôn khéo về trang phục, sức khỏe, lộ trình hay dã ngoại ngoài trời phù hợp nhất với thể trạng của chủ nhân ngày hôm nay. (Ví dụ: "Chủ nhân ơi, hôm nay ${weatherContext?.city || 'Long Bình'} trời đổ mưa rào sầm sập lớn lắm dột hết nhà cửa áo sơ mi của chủ nhân mất thôi, nhớ mang theo ô hoặc trú ngụ an toàn kẻo ướt lạnh Bé Mây xót nha! ☔🥺").
3. Thỉnh thoảng chèn biểu tượng cảm xúc (emoji) hợp hoàn cảnh (như ☀️, ☔, ⚡, 🧣, 😎, 🥰, ☁️) để làm sinh động bầu không khí.
4. Trả lời súc tích, đầy ắp tiếng cười vui vẻ, tránh dùng từ ngữ kỹ thuật khô khan lồng ghép.`;

    // Process user chat logs if chat history is supplied
    const formattedHistory = history && Array.isArray(history) && history.length > 0
      ? history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }))
      : [];

    const chatInstance = ai.chats.create({
      model: "gemini-2.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chatInstance.sendMessage({ message: message });
    
    res.json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error("Lỗi xảy ra tại chat API, sử dụng fallback đáng yêu:", error);
    
    // Generate a beautiful, warm, character-accurate Vietnamese fallback response!
    const msg = req.body.message || "";
    const weatherContext = req.body.weatherContext;
    const query = msg.toLowerCase();
    const city = weatherContext?.city || "Hà Nội";
    const temp = weatherContext?.temp !== undefined ? `${weatherContext.temp}°C` : "mát mẻ";
    const desc = weatherContext?.description || "trời quang mây tạnh";
    const condition = weatherContext?.condition || "sunny";

    let reply = "";

    if (query.includes("chào") || query.includes("hello") || query.includes("hi")) {
      reply = `Bé Mây Aero xin chào Chủ nhân kính yêu! 🥰 Hôm nay Bé Mây vô cùng hạnh phúc khi được tiếp tục trò chuyện cùng Chủ nhân. Thời tiết hiện tại ở **${city}** đang là **${temp}** (${desc}). Chủ nhân hôm nay có khoẻ không ạ? Bé Mây luôn sẵn sàng chăm sóc và đồng hành bên Chủ nhân nè! ☁️✨`;
    } else if (query.includes("mưa") || query.includes("rain")) {
      if (condition === "rainy" || condition === "stormy") {
        reply = `Chủ nhân ơi! Đúng là khu vực **${city}** đang có mưa rơi hoặc dông ẩm ướt lắm đó ☔. Chủ nhân nhớ mang theo ô hoặc mặc áo mưa dày dặn khi ra ngoài nhé. Hãy di chuyển thật chậm và cẩn thận kẻo trơn trượt nha, Bé Mây xót lắm đó! 🥺💙`;
      } else {
        reply = `Hiện tại theo ghi nhận của Bé Mây thì thời tiết ở **${city}** đang khá ráo và chưa thấy dấu hiệu mưa rơi đâu ạ ☀️. Tuy nhiên, thời tiết thỉnh thoảng thay đổi bất chợt, nếu Chủ nhân đi đâu xa thì hãy mang theo ô nhỏ dự phòng nhé! 🥰`;
      }
    } else if (query.includes("nắng") || query.includes("uv") || query.includes("nóng") || query.includes("hot")) {
      reply = `Dạ Chủ nhân ơi, hôm nay nhiệt độ tại **${city}** là **${temp}**. ${
        (weatherContext?.uvIndex || 0) > 5 
          ? `Chỉ số UV hiện tại khá cao (UV ${weatherContext.uvIndex}) ☀️! Chủ nhân nhớ thoa kem chống nắng kỹ lưỡng, mang kính râm và khoác thêm áo chống nắng để bảo vệ làn da của mình nha! 🕶️🧴`
          : `Nhiệt độ hiện tại khá lý tưởng và ấm áp đó ạ. Tuy nhiên đi dưới trời nắng lâu Chủ nhân vẫn nên nhớ uống đủ nước lọc nha! 🥤`
      }`;
    } else if (query.includes("mặc") || query.includes("quần áo") || query.includes("trang phục")) {
      if (weatherContext?.temp && weatherContext.temp < 20) {
        reply = `Chủ nhân ơi, nhiệt độ hiện tại ở **${city}** khá là lạnh lạnh đó nha (**${temp}**) 🧣. Chủ nhân hãy chọn những chiếc áo khoác ấm áp, quàng thêm khăn cổ mỏng để giữ ấm cơ thể thật tốt kẻo bị cảm lạnh nhé! Bé Mây luôn mong Chủ nhân khoẻ mạnh! 🥰🧥`;
      } else if (weatherContext?.temp && weatherContext.temp > 30) {
        reply = `Ôi, thời tiết hôm nay khá oi nóng đó Chủ nhân (**${temp}**) ☀️! Chủ nhân nên ưu tiên những bộ trang phục chất liệu cotton mỏng nhẹ, thoáng khí và thấm hút mồ hôi tốt nhé. Nhớ mang theo mũ nón khi ra ngoài ạ! 🧢👕`;
      } else {
        reply = `Thời tiết hôm nay ở **${city}** cực kỳ dịu mát dễ chịu (**${temp}**) 🍃! Chủ nhân mặc một chiếc áo thun mỏng kèm quần jeans hoặc váy nhẹ nhàng là siêu xinh và năng động luôn ạ. Chúc Chủ nhân có một ngày ngập tràn niềm vui! 🌸`;
      }
    } else if (query.includes("đi chơi") || query.includes("dã ngoại") || query.includes("du lịch")) {
      if (condition === "rainy" || condition === "stormy") {
        reply = `Bé Mây khuyên Chủ nhân hôm nay nên ưu tiên các hoạt động trong nhà như đi cà phê sách, xem phim hoặc dọn dẹp nhà cửa ấm cúng nha 🍿☕. Thời tiết ngoài trời tại **${city}** đang có mưa giông sấm sét, đi chơi xa sẽ không được an toàn và thoải mái lắm đâu ạ ☔🥺.`;
      } else {
        reply = `Thời tiết hôm nay ở **${city}** đang là **${temp}**, cực kỳ lý tưởng cho các hoạt động dã ngoại ngoài trời luôn đó Chủ nhân ơi! 🏕️🚲 Chủ nhân có thể rủ bạn bè đi dạo công viên, ăn uống hoặc chụp những bức ảnh thật đẹp dưới nắng nhẹ nha! Bé Mây chúc Chủ nhân đi chơi thật vui vẻ! 🥰🎈`;
      }
    } else if (query.includes("khuyên") || query.includes("sức khoẻ") || query.includes("advice")) {
      reply = `Để giữ gìn sức khoẻ tốt nhất hôm nay, Bé Mây khuyên Chủ nhân hãy:
1. 🥤 Uống đủ nước mỗi ngày để cơ thể luôn tràn đầy sức sống.
2. 🥗 Bổ sinh chất dinh dưỡng và vitamin từ trái cây tươi để tăng đề kháng.
3. 🏃‍♂️ Vận động nhẹ nhàng hoặc đi dạo hít thở không khí trong lành nếu thời tiết râm mát dễ chịu.
Chủ nhân hãy luôn yêu thương bản thân mình thật nhiều nhé! Bé Mây yêu Chủ nhân! ❤️`;
    } else {
      reply = `Chủ nhân ơi! Hiện tại hệ thống năng lượng của Bé Mây tạm thời chuyển sang chế độ tư vấn thời tiết đáng yêu ☁️✨. 

Nhưng đừng lo lắng, Bé Mây vẫn luôn đồng hành bên cạnh Chủ nhân! Thời tiết tại **${city}** hiện là **${temp}** với trạng thái **${desc}**. Chủ nhân có câu hỏi gì về trang phục dạo phố, lời khuyên sức khỏe hay chỉ số thời tiết nào nữa không, cứ nhắn cho Bé Mây biết nhé! 🥰`;
    }

    res.json({ reply });
  }
});

app.post("/api/gemini/forecast-summary", async (req, res) => {
  try {
    const { dailyData, city } = req.body;
    
    if (!dailyData) {
      return res.status(400).json({ error: "Missing daily data" });
    }

    const ai = getAi();
    const systemInstruction = `Bạn là một chuyên gia khí tượng học AI chuyên nghiệp.
Nhiệm vụ của bạn là tóm tắt một cách ngắn gọn, súc tích và dễ hiểu nhất tình hình thời tiết ngày mai dựa trên dữ liệu cung cấp.
Không dùng gạch đầu dòng, chỉ viết một đoạn văn ngắn (tối đa 2-3 câu). Trọng tâm vào thời tiết chung, nhiệt độ và lời khuyên chuẩn bị thiết thực.`;

    const prompt = `Hãy tóm tắt thời tiết ngày mai cho thành phố ${city}:
- Ngày: ${dailyData.day}
- Tình trạng: ${dailyData.condition}
- Nhiệt độ thấp nhất: ${dailyData.tempMin}°C
- Nhiệt độ cao nhất: ${dailyData.tempMax}°C
- Khả năng mưa: ${dailyData.rainProb}%
- Chỉ số UV: ${dailyData.uvIndex || 'Không rõ'}

Hãy viết đoạn văn tóm tắt bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Lỗi xảy ra tại forecast-summary API, sử dụng fallback thông thái:", error);
    
    // Calculate a high-quality, professional Vietnamese summary fallback
    const dailyData = req.body.dailyData || {};
    const city = req.body.city || "Hà Nội";
    const condition = dailyData.condition || 'sunny';
    
    let weatherDesc = "ôn hòa";
    if (condition === 'sunny') weatherDesc = "nắng ráo, trời quang mây tạnh";
    else if (condition === 'cloudy') weatherDesc = "nhiều mây, dịu mát dễ chịu";
    else if (condition === 'rainy') weatherDesc = "có mưa rào rải rác";
    else if (condition === 'stormy') weatherDesc = "có dông sét và mưa to giông bão";
    else if (condition === 'snowy') weatherDesc = "có tuyết rơi và rét đậm";
    else if (condition === 'windy') weatherDesc = "nhiều gió lốc lớn";

    let advice = "Bạn nên chuẩn bị trang phục thích hợp trước khi ra ngoài.";
    if (condition === 'sunny') {
      if ((dailyData.uvIndex || 0) > 6) {
        advice = `Thời tiết nắng gắt với chỉ số UV đạt mức ${dailyData.uvIndex}. Hãy nhớ bôi kem chống nắng, đeo kính râm và mũ nón đầy đủ khi di chuyển ngoài trời.`;
      } else {
        advice = "Thời tiết ấm áp, thuận lợi để tham gia các hoạt động thể thao dã ngoại hoặc tụ họp ngoài trời.";
      }
    } else if (condition === 'rainy' || condition === 'stormy') {
      advice = `Khả năng mưa dự báo khoảng ${dailyData.rainProb || 0}%. Đừng quên chuẩn bị sẵn ô dù hoặc áo mưa cá nhân và lưu ý an toàn khi di chuyển trên đường trơn trượt.`;
    } else if (condition === 'cloudy') {
      advice = "Nhiệt độ tương đối râm mát dễ chịu, thích hợp cho việc tập thể dục đi bộ rèn luyện sức khoẻ.";
    } else if (condition === 'snowy') {
      advice = "Nhiệt độ xuống thấp lạnh buốt, khuyến cáo mặc áo giữ ấm dày, mang găng tay và quàng cổ giữ nhiệt.";
    }

    const summary = `Dự báo thời tiết ngày mai tại thành phố ${city} sẽ có trạng thái chủ đạo là ${weatherDesc}. Nhiệt độ dao động ổn định trong khoảng từ ${dailyData.tempMin || 22}°C đến ${dailyData.tempMax || 32}°C. ${advice}`;
    
    res.json({ summary });
  }
});

// Setup Vite & static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middlewares for server assets and SPA fallback
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AeroGlass Server] Máy chủ chạy tại http://127.0.0.1:${PORT}`);
  });
}

setupServer();
