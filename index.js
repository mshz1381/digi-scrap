import axios from "axios";
import fs from "fs";

const URL = "https://api.digikala.com/v1/incredible-offers/products/?page=1&q=";

async function scrape() {
  try {
    console.log("⏳ دریافت اطلاعات از API...");

    const response = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json"
      },
      maxRedirects: 5,
      timeout: 15000
    });

    const products = response.data?.data?.products;
    if (!products || products.length === 0) {
      console.error("❌ هیچ محصولی دریافت نشد!");
      return; // فایل ساخته نمی‌شود
    }

    console.log("🟢 تعداد محصولات:", products.length);

    const result = products.map(p => ({
      id: p.id,
      title: p.title_fa,
      image: p.images.main?.url || "",
      link: "https://www.digikala.com/product/" + p.id,
      price_original: p.default_variant?.price || null,
      price_discounted:
        (p.default_variant?.price || 0) - (p.default_variant?.discount?.amount || 0),
      discount_percent: p.default_variant?.discount?.percent || 0
    }));

    fs.writeFileSync("./products.json", JSON.stringify(result, null, 2));
    console.log("💾 فایل products.json ذخیره شد.");

  } catch (err) {
    console.error("❌ خطا:", err.message);
  }
}

scrape();
