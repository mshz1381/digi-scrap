import axios from "axios";
import fs from "fs";

const URL = "https://api.digikala.com/v1/incredible-offers/products/?page=1";

async function scrape() {
  try {
    console.log("⏳ دریافت اطلاعات از API...");

    // درخواست با مدیریت redirect و timeout
    const response = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json"
      },
      maxRedirects: 10,
      timeout: 20000
    });

    const products = response.data?.data?.products || [];

    if (products.length === 0) {
      console.warn("⚠️ هیچ محصولی دریافت نشد، یک فایل خالی ایجاد می‌کنیم...");
    } else {
      console.log("🟢 تعداد محصولات دریافت شده:", products.length);
    }

    // ساخت آرایه نتیجه حتی اگر محصولات خالی باشند
    const result = products.map(p => ({
      id: p.id || null,
      title: p.title_fa || "",
      image: p.images?.main?.url || "",
      link: p.id ? `https://www.digikala.com/product/${p.id}` : "",
      price_original: p.default_variant?.price || null,
      price_discounted:
        (p.default_variant?.price || 0) - (p.default_variant?.discount?.amount || 0),
      discount_percent: p.default_variant?.discount?.percent || 0
    }));

    // حتماً فایل products.json ساخته می‌شود حتی اگر خالی باشد
    fs.writeFileSync("./products.json", JSON.stringify(result, null, 2));
    console.log("💾 فایل products.json ساخته شد و آماده push است.");

  } catch (err) {
    console.error("❌ خطا در دریافت API:", err.message);

    // ایجاد یک فایل خالی در صورت خطا تا workflow crash نکند
    fs.writeFileSync("./products.json", "[]");
    console.log("💾 فایل products.json خالی ساخته شد تا workflow ادامه یابد.");
  }
}

scrape();
