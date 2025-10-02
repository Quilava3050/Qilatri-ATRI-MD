import axios from "axios";

const Keyyy = "05120a7d-66b6-4973-b8c4-d3604f7087e7:baef4baa908c8010604ade6d3076274b";

export async function BananaEdit(imageInput, prompt) {
  try {
    let imageUrls = [];

    // ✅ Kalau input string (anggap URL)
    if (typeof imageInput === "string") {
      imageUrls.push(imageInput);
    }

    // ✅ Kalau input Buffer (misalnya hasil download dari Baileys)
    else if (Buffer.isBuffer(imageInput)) {
      const upload = await axios.post(
        "https://fal.run/tmp/upload",
        imageInput,
        {
          headers: {
            Authorization: `Key ${Keyyy}`,
            "Content-Type": "image/jpeg", // bisa diganti sesuai mimetype
          },
        }
      );
      imageUrls.push(upload.data.url);
    } else {
      throw new Error("❌ Input gambar tidak valid (harus URL atau Buffer).");
    }

    // ✅ Request edit
    const create = await axios.post(
      "https://queue.fal.run/fal-ai/gemini-25-flash-image/edit",
      {
        prompt,
        num_images: 1,
        output_format: "jpeg",
        image_urls: imageUrls,
      },
      {
        headers: {
          Authorization: `Key ${Keyyy}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const { status_url: statusUrl, response_url: responseUrl } = create.data;

    let status = "WAIT";
    while (status !== "COMPLETED") {
      const res = await axios.get(statusUrl, {
        headers: { Authorization: `Key ${Keyyy}` },
      });
      status = res.data.status;

      if (status === "FAILED") {
        throw new Error("❌ Proses gagal dijalankan oleh server.");
      }

      if (status !== "COMPLETED") {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // ✅ Ambil hasil
    const result = await axios.get(responseUrl, {
      headers: { Authorization: `Key ${Keyyy}` },
    });

    const imageUrlOut = result.data.images[0].url;
    const img = await axios.get(imageUrlOut, { responseType: "arraybuffer" });

    return Buffer.from(img.data);
  } catch (err) {
    throw new Error(err.response?.data || err.message);
  }
}
