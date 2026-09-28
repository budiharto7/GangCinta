import { api } from "../services/apiService";

/**
 * Compresses and prepares an image file from HP camera / gallery
 * - Auto-detects portrait photos of landscape KK documents and rotates 90 deg clockwise
 * - Supports explicit rotation angle (0, 90, 180, 270)
 * - Resizes large smartphone camera photos (e.g. 12MP/48MP) to optimal OCR resolution (1800px max)
 */
export async function optimizeImageForOCR(fileOrDataUrl, maxDimension = 1800, explicitRotation = null) {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) return resolve(null);

    const processImg = (imgSrc) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Determine rotation angle
        let rotationAngle = 0;
        if (typeof explicitRotation === "number") {
          rotationAngle = ((explicitRotation % 360) + 360) % 360;
        } else if (height > width) {
          // Indonesian Kartu Keluarga is standard landscape format.
          // Smartphone photos taken in portrait orientation need 90 deg rotation to be readable horizontally.
          rotationAngle = 90;
        }

        const isSwapped = rotationAngle === 90 || rotationAngle === 270;
        let finalWidth = isSwapped ? height : width;
        let finalHeight = isSwapped ? width : height;

        // Scale down if larger than maxDimension while preserving aspect ratio
        if (finalWidth > maxDimension || finalHeight > maxDimension) {
          if (finalWidth > finalHeight) {
            finalHeight = Math.round((finalHeight * maxDimension) / finalWidth);
            finalWidth = maxDimension;
          } else {
            finalWidth = Math.round((finalWidth * maxDimension) / finalHeight);
            finalHeight = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext("2d");

        // Fill white background (avoids black borders)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // Apply rotation
        ctx.save();
        ctx.translate(finalWidth / 2, finalHeight / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);

        const drawW = isSwapped ? finalHeight : finalWidth;
        const drawH = isSwapped ? finalWidth : finalHeight;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Export as JPEG at 0.88 quality
        const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.88);
        resolve(optimizedBase64);
      };

      img.onerror = () => resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : null);
      img.src = imgSrc;
    };

    if (typeof fileOrDataUrl === "string") {
      processImg(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImg(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Intelligent Client-side KK Text Parser
 */
export function parseKKText(text) {
  if (!text || typeof text !== "string") {
    return {
      kkNumber: "",
      headOfFamily: "",
      block: "Blok F4",
      houseNumber: "No. 01",
      address: "",
      members: []
    };
  }

  const cleanText = text.replace(/\r/g, "\n");
  const rawLines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);

  // Helper to extract 16-digit sequences from a specific line or string
  function get16DigitsFrom(str) {
    const list = [];
    const regex = /(?:^|[^0-9A-Za-z])([1-9][0-9\s\.\-]{14,22}[0-9])(?:[^0-9A-Za-z]|$)/g;
    let m;
    while ((m = regex.exec(str)) !== null) {
      const digits = m[1].replace(/[\s\.\-]/g, "");
      if (digits.length === 16 && /^[1-9]/.test(digits) && !list.includes(digits)) {
        list.push(digits);
      }
    }
    return list;
  }

  // 1. Separate document into Top Header Zone and Member Table Zone
  let tableHeaderIdx = rawLines.findIndex(l => 
    /(?:Nama\s+Lengkap|Jenis\s+Kelamin|Tempat\s+Lahir)/i.test(l) &&
    !/Nama\s+Kepala\s+Keluarga/i.test(l)
  );

  if (tableHeaderIdx === -1) {
    tableHeaderIdx = rawLines.findIndex((l, idx) => 
      idx >= 2 && /^[1I][\.\s\)\-]+[A-Za-z]/.test(l)
    );
  }

  const headerLines = tableHeaderIdx !== -1 ? rawLines.slice(0, tableHeaderIdx) : rawLines;
  const tableLines = tableHeaderIdx !== -1 ? rawLines.slice(tableHeaderIdx) : [];

  // 2. Extract KK Number STRICTLY from the Top Header Zone
  let kkNumber = "";

  // Priority A: Check lines near "KARTU KELUARGA" or "REPUBLIK INDONESIA" in the top header
  for (let i = 0; i < headerLines.length; i++) {
    const line = headerLines[i];
    if (/KARTU\s*KELUARGA|REPUBLIK\s*INDONESIA/i.test(line)) {
      for (let j = i; j <= Math.min(i + 3, headerLines.length - 1); j++) {
        if (/Nama\s+Kepala|Alamat|RT[\/\.]?RW/i.test(headerLines[j])) break;
        const candidates = get16DigitsFrom(headerLines[j]);
        if (candidates.length > 0) {
          kkNumber = candidates[0];
          break;
        }
      }
      if (kkNumber) break;
    }
  }

  // Priority B: Check lines above "Nama Kepala Keluarga" or "Alamat" that have "No" or "Nomor"
  if (!kkNumber) {
    const metaIdx = headerLines.findIndex(l => /Nama\s+Kepala|Alamat/i.test(l));
    const preMetaLines = metaIdx > 0 ? headerLines.slice(0, metaIdx) : headerLines.slice(0, 5);
    for (const line of preMetaLines) {
      if (/(?:No|Nomor)/i.test(line)) {
        const candidates = get16DigitsFrom(line);
        if (candidates.length > 0) {
          kkNumber = candidates[0];
          break;
        }
      }
    }
  }

  // Priority C: Check any 16 digits in the top 4 lines of document before metadata
  if (!kkNumber) {
    for (let i = 0; i < Math.min(4, headerLines.length); i++) {
      if (/Nama\s+Kepala|Alamat/i.test(headerLines[i])) break;
      const candidates = get16DigitsFrom(headerLines[i]);
      if (candidates.length > 0) {
        kkNumber = candidates[0];
        break;
      }
    }
  }

  // 3. Extract Head of Family (Nama Kepala Keluarga)
  let headOfFamily = "";
  for (let i = 0; i < headerLines.length; i++) {
    const line = headerLines[i];
    const match = line.match(/(?:Nama\s+Kepala\s+Keluarga|Kepala\s+Keluarga|Nama\s+KK)\s*[:\.\-]?\s*([^\n\r]*)/i);
    if (match) {
      let val = match[1].trim();
      if (!val && i + 1 < headerLines.length) {
        val = headerLines[i + 1].trim();
      }
      headOfFamily = val
        .replace(/^(Bpk\.?|Ibu\.?|Bapak\.?|Sdr\.?)\s*/i, "")
        .replace(/(?:Alamat|RT|RW|Desa|Kelurahan)[\s\S]*/i, "")
        .replace(/[^A-Za-z\s\.\,]/g, "")
        .trim();
      if (headOfFamily) break;
    }
  }

  // 4. Extract Block, House Number, Address
  let block = "Blok F4";
  const blockMatch = cleanText.match(/Blok\s*([A-Za-z0-9]+)/i);
  if (blockMatch) {
    const val = blockMatch[1].toUpperCase();
    if (val.includes("F6") || val.includes("6")) block = "Blok F6";
    else block = "Blok F4";
  }

  let houseNumber = "";
  const houseMatch = cleanText.match(/(?:No|Nomor|Rumah)\s*[\.\:\#]?\s*([0-9]{1,3})(?![0-9])/i);
  if (houseMatch) {
    houseNumber = "No. " + houseMatch[1].padStart(2, "0");
  }

  let address = "";
  const addrMatch = cleanText.match(/Alamat\s*[:\.\-]?\s*([^\n\r]+)/i);
  if (addrMatch) {
    address = addrMatch[1].replace(/^(?:RT|RW)[\s\S]*/i, "").trim();
  }

  let rt = "028";
  let rw = "005";
  const rtrwMatch = cleanText.match(/RT\s*[\/\.]?\s*RW\s*[:\.\-]?\s*([0-9]{1,3})\s*[\/\-]\s*([0-9]{1,3})/i);
  if (rtrwMatch) {
    rt = rtrwMatch[1].padStart(3, "0");
    rw = rtrwMatch[2].padStart(3, "0");
  }

  if (!address || address.length < 5) {
    address = `Gang Cinta RT ${rt} RW ${rw}, Perumahan Bumi Nagara Lestari, ${block} ${houseNumber || "No. 01"}`;
  }

  // 5. Extract Members strictly from Table Lines (or lines containing 16-digit NIKs)
  const members = [];
  const searchLines = tableLines.length > 0 ? tableLines : rawLines;
  const religions = ["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Konghucu"];

  for (let i = 0; i < searchLines.length; i++) {
    const line = searchLines[i];
    // Skip table header definitions
    if (/(?:Nama\s+Lengkap|Jenis\s+Kelamin|Tempat\s+Lahir|Status\s+Hubungan)/i.test(line)) continue;

    const candidates = get16DigitsFrom(line);
    if (candidates.length > 0) {
      const nik = candidates[0];
      // Do not treat header KK number as member NIK unless it's row 1 in a cropped doc
      if (nik === kkNumber && tableLines.length === 0 && i < 3) continue;

      // Extract member name before NIK
      const parts = line.split(nik);
      let memberName = (parts[0] || "")
        .replace(/^[0-9Iil\.\s\)\-]*/, "")
        .replace(/[^A-Za-z\s\.\,]/g, "")
        .trim();

      const afterNIK = parts[1] || "";
      let gender = "Laki-laki";
      if (/PEREMPUAN|WANITA|\bP\b/i.test(afterNIK)) gender = "Perempuan";
      else if (/LAKI|\bL\b/i.test(afterNIK)) gender = "Laki-laki";

      let birthDate = "1990-01-01";
      const dateMatch = afterNIK.match(/([0-9]{2})[\-\/\.]([0-9]{2})[\-\/\.]([0-9]{4})/);
      if (dateMatch) birthDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;

      let birthPlace = "Jakarta";
      const bpMatch = afterNIK.match(/([A-Z]{3,20})\s+[0-9]{2}[\-\/\.]/);
      if (bpMatch) birthPlace = bpMatch[1].trim();

      let job = "Karyawan Swasta";
      if (/IBU\s*RUMAH\s*TANGGA/i.test(afterNIK)) job = "Ibu Rumah Tangga";
      else if (/PELAJAR|MAHASISWA/i.test(afterNIK)) job = "Pelajar / Mahasiswa";
      else if (/WIRASWASTA/i.test(afterNIK)) job = "Wiraswasta";
      else if (/PNS|PEGAWAI/i.test(afterNIK)) job = "PNS / ASN";
      else if (/BURUH/i.test(afterNIK)) job = "Buruh Harian Lepas";
      else if (/GURU/i.test(afterNIK)) job = "Guru / Pendidik";
      else if (/BELUM.*BEKERJA|TIDAK.*BEKERJA/i.test(afterNIK)) job = "Belum/Tidak Bekerja";

      let religion = "Islam";
      for (const rel of religions) {
        if (new RegExp(rel, "i").test(afterNIK)) {
          religion = rel;
          break;
        }
      }

      // Member order:
      // Row 0 is ALWAYS Kepala Keluarga!
      let relation = "Anak";
      if (members.length === 0) {
        relation = "Kepala Keluarga";
        if ((!memberName || memberName.length < 3) && headOfFamily) {
          memberName = headOfFamily;
        }
      } else if (members.length === 1 && gender === "Perempuan") {
        relation = "Istri";
      }

      if (!memberName) {
        memberName = members.length === 0 && headOfFamily ? headOfFamily : `Anggota Keluarga ${members.length + 1}`;
      }

      members.push({
        id: `mem-${Date.now()}-${members.length}`,
        fullName: memberName,
        nik,
        relation,
        gender,
        birthPlace,
        birthDate,
        job,
        religion,
        bloodType: "-"
      });
    }
  }

  // Fallback: If no member row had a 16-digit NIK, but headOfFamily was detected
  if (members.length === 0 && headOfFamily) {
    const allDigits = get16DigitsFrom(cleanText);
    const unassignedNik = allDigits.find(d => d !== kkNumber) || "";

    members.push({
      id: `mem-${Date.now()}-0`,
      fullName: headOfFamily,
      nik: unassignedNik,
      relation: "Kepala Keluarga",
      gender: "Laki-laki",
      birthPlace: "Jakarta",
      birthDate: "1985-01-01",
      job: "Karyawan Swasta",
      religion: "Islam",
      bloodType: "-"
    });
  }

  const finalHead = headOfFamily || (members[0] ? members[0].fullName : "");

  return {
    kkNumber: kkNumber || "",
    headOfFamily: finalHead,
    block: block || "Blok F4",
    houseNumber: houseNumber || "No. 01",
    address,
    members
  };
}

/**
 * Real OCR Parsing of uploaded Kartu Keluarga image
 * Accepts either File or base64 dataUrl, with optional explicit rotation angle (e.g. 90)
 */
export async function parseKKImage(fileOrDataUrl, explicitRotation = null) {
  try {
    // 1. Optimize image (auto-orient landscape or apply explicit rotation)
    let base64Data;
    try {
      base64Data = await Promise.race([
        optimizeImageForOCR(fileOrDataUrl, 1800, explicitRotation),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
    } catch {
      if (typeof fileOrDataUrl === "string") {
        base64Data = fileOrDataUrl;
      } else {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(fileOrDataUrl);
        });
      }
    }

    // 2. Call backend OCR endpoint
    const res = await api.parseKK(base64Data || "").catch(() => null);
    if (res && res.success && res.data) {
      const parsed = res.data;
      const hasContent = Boolean(parsed.kkNumber || parsed.headOfFamily || (parsed.members && parsed.members.length > 0));
      return {
        success: true,
        hasContent,
        data: parsed,
        previewUrl: base64Data,
        message: hasContent
          ? "Data Kartu Keluarga berhasil diekstraksi dari foto secara otomatis!"
          : "Foto KK tersimpan, namun teks belum terdeteksi. Silakan putar foto atau lengkapi formulir."
      };
    }

    // 3. Fallback extraction structure
    return {
      success: true,
      hasContent: false,
      data: {
        kkNumber: "",
        headOfFamily: "",
        block: "Blok F4",
        houseNumber: "No. 01",
        address: "",
        members: []
      },
      previewUrl: base64Data,
      message: "Foto KK tersimpan. Silakan periksa atau lengkapi data pada formulir di bawah."
    };
  } catch (error) {
    console.error("KK OCR parsing error:", error);
    return {
      success: false,
      hasContent: false,
      data: null,
      message: "Terjadi kesalahan saat memproses foto KK."
    };
  }
}

