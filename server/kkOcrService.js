import Tesseract from 'tesseract.js';

/**
 * Intelligent Indonesian Kartu Keluarga (KK) Text Parser
 * Extracts structured data from raw OCR text
 */
export function parseKKText(text) {
  if (!text || typeof text !== 'string') {
    return {
      kkNumber: '',
      headOfFamily: '',
      block: 'Blok F4',
      houseNumber: 'No. 01',
      address: '',
      members: []
    };
  }

  const cleanText = text.replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract 16-Digit KK Number
  let kkNumber = '';
  // Try pattern: "KARTU KELUARGA" followed by 16 digits
  const kkExplicitMatch = cleanText.match(/(?:Kartu\s*Keluarga[\s\S]{0,60}?)?(?:No[\.\:\s]*)?([1-9][0-9]{15})/i);
  if (kkExplicitMatch) {
    kkNumber = kkExplicitMatch[1];
  } else {
    // Look for any 16-digit number near the top 10 lines
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const match = lines[i].match(/\b([1-9][0-9]{15})\b/);
      if (match) {
        kkNumber = match[1];
        break;
      }
    }
  }

  // 2. Extract Head of Family (Nama Kepala Keluarga)
  let headOfFamily = '';
  const headMatch = cleanText.match(/(?:Nama\s+Kepala\s+Keluarga|Kepala\s+Keluarga)\s*[:\.\-]?\s*([^\n\r]+)/i);
  if (headMatch) {
    headOfFamily = headMatch[1]
      .replace(/^(Bpk\.?|Ibu\.?|Bapak\.?|Sdr\.?)\s*/i, '')
      .replace(/(?:Alamat|RT|RW|Desa|Kelurahan)[\s\S]*/i, '')
      .replace(/[^A-Za-z\s\.\,]/g, '')
      .trim();
  }

  // 3. Extract Block (Blok F4 / Blok F6)
  let block = 'Blok F4';
  const blockMatch = cleanText.match(/Blok\s*([A-Za-z0-9]+)/i);
  if (blockMatch) {
    const val = blockMatch[1].toUpperCase();
    if (val.includes('F6') || val.includes('6')) {
      block = 'Blok F6';
    } else {
      block = 'Blok F4';
    }
  }

  // 4. Extract House Number
  let houseNumber = '';
  const houseMatch = cleanText.match(/(?:No|Nomor|Rumah)\s*[\.\:\#]?\s*([0-9]{1,3})(?![0-9])/i);
  if (houseMatch) {
    houseNumber = 'No. ' + houseMatch[1].padStart(2, '0');
  }

  // 5. Extract Address
  let address = '';
  const addrMatch = cleanText.match(/Alamat\s*[:\.\-]?\s*([^\n\r]+)/i);
  if (addrMatch) {
    address = addrMatch[1].replace(/^(?:RT|RW)[\s\S]*/i, '').trim();
  }

  // Look for RT/RW
  let rt = '028';
  let rw = '005';
  const rtrwMatch = cleanText.match(/RT\s*[\/\.]?\s*RW\s*[:\.\-]?\s*([0-9]{1,3})\s*[\/\-]\s*([0-9]{1,3})/i);
  if (rtrwMatch) {
    rt = rtrwMatch[1].padStart(3, '0');
    rw = rtrwMatch[2].padStart(3, '0');
  }

  if (!address || address.length < 5) {
    address = `Gang Cinta RT ${rt} RW ${rw}, Perumahan Bumi Nagara Lestari, ${block} ${houseNumber || 'No. 01'}`;
  }

  // 6. Extract Members (Anggota Keluarga)
  const members = [];
  const all16Digits = [...cleanText.matchAll(/\b([1-9][0-9]{15})\b/g)].map(m => m[1]);
  // Filter out the KK Number to get individual NIKs
  const memberNIKs = all16Digits.filter((nik, idx) => nik !== kkNumber || idx > 0);

  // Common Indonesian religion keywords
  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu'];
  
  // Parse each detected NIK
  for (let i = 0; i < memberNIKs.length; i++) {
    const nik = memberNIKs[i];
    const lineIndex = lines.findIndex(l => l.includes(nik));
    let memberName = '';
    let gender = 'Laki-laki';
    let birthPlace = 'Jakarta';
    let birthDate = '1990-01-01';
    let job = 'Karyawan Swasta';
    let relation = i === 0 ? 'Kepala Keluarga' : (i === 1 ? 'Istri' : 'Anak');
    let religion = 'Islam';

    if (lineIndex !== -1) {
      const line = lines[lineIndex];
      const parts = line.split(nik);
      
      // Member Name before NIK
      const beforeNIK = parts[0]
        .replace(/^[0-9]+[\.\s\)\-]*/, '') // strip row number like "1." or "1)"
        .replace(/[^A-Za-z\s\.\,]/g, '')
        .trim();

      if (beforeNIK.length >= 3) {
        memberName = beforeNIK;
      }

      // Details after NIK
      const afterNIK = parts[1] || '';
      
      // Gender detection
      if (/PEREMPUAN|WANITA|\bP\b/i.test(afterNIK)) {
        gender = 'Perempuan';
      } else if (/LAKI|\bL\b/i.test(afterNIK)) {
        gender = 'Laki-laki';
      }

      // Birth Date detection (DD-MM-YYYY or DD/MM/YYYY)
      const dateMatch = afterNIK.match(/([0-9]{2})[\-\/\.]([0-9]{2})[\-\/\.]([0-9]{4})/);
      if (dateMatch) {
        const [, d, m, y] = dateMatch;
        birthDate = `${y}-${m}-${d}`;
      }

      // Birth Place detection
      const bpMatch = afterNIK.match(/([A-Z]{3,20})\s+[0-9]{2}[\-\/\.]/);
      if (bpMatch) {
        birthPlace = bpMatch[1].trim();
      }

      // Job detection
      if (/IBU\s*RUMAH\s*TANGGA/i.test(afterNIK)) job = 'Ibu Rumah Tangga';
      else if (/PELAJAR|MAHASISWA/i.test(afterNIK)) job = 'Pelajar / Mahasiswa';
      else if (/WIRASWASTA/i.test(afterNIK)) job = 'Wiraswasta';
      else if (/PNS|PEGAWAI\s*NEGERI/i.test(afterNIK)) job = 'PNS / ASN';
      else if (/BURUH/i.test(afterNIK)) job = 'Buruh Harian Lepas';
      else if (/GURU/i.test(afterNIK)) job = 'Guru / Pendidik';
      else if (/BELUM.*BEKERJA|TIDAK.*BEKERJA/i.test(afterNIK)) job = 'Belum/Tidak Bekerja';
      else if (/KARYAWAN/i.test(afterNIK)) job = 'Karyawan Swasta';

      // Religion detection
      for (const rel of religions) {
        if (new RegExp(rel, 'i').test(afterNIK)) {
          religion = rel;
          break;
        }
      }
    }

    // Default name if not found from row
    if (!memberName && i === 0 && headOfFamily) {
      memberName = headOfFamily;
    }
    if (!memberName) {
      memberName = `Anggota Keluarga ${i + 1}`;
    }

    // Check relationship
    if (i === 0) {
      relation = 'Kepala Keluarga';
    } else if (i === 1 && gender === 'Perempuan') {
      relation = 'Istri';
    } else {
      relation = 'Anak';
    }

    members.push({
      id: `mem-${Date.now()}-${i}`,
      fullName: memberName,
      nik: nik,
      relation,
      gender,
      birthPlace,
      birthDate,
      job,
      religion,
      bloodType: '-'
    });
  }

  // If no member rows had 16-digit NIK, but head of family was detected
  if (members.length === 0 && headOfFamily) {
    members.push({
      id: `mem-${Date.now()}-0`,
      fullName: headOfFamily,
      nik: '',
      relation: 'Kepala Keluarga',
      gender: 'Laki-laki',
      birthPlace: 'Jakarta',
      birthDate: '1985-01-01',
      job: 'Karyawan Swasta',
      religion: 'Islam',
      bloodType: '-'
    });
  }

  const finalHead = headOfFamily || (members[0] ? members[0].fullName : '');

  return {
    kkNumber: kkNumber || '',
    headOfFamily: finalHead,
    block: block || 'Blok F4',
    houseNumber: houseNumber || 'No. 01',
    address,
    members,
    rawTextLength: text.length
  };
}

/**
 * Perform OCR on Image Buffer or Base64 and parse KK data
 */
export async function processKKImageOCR(imageBufferOrBase64) {
  let buffer;
  if (Buffer.isBuffer(imageBufferOrBase64)) {
    buffer = imageBufferOrBase64;
  } else if (typeof imageBufferOrBase64 === 'string') {
    const base64Data = imageBufferOrBase64.replace(/^data:image\/\w+;base64,/, '');
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    throw new Error('Format gambar tidak valid.');
  }

  // Run Tesseract OCR with English/Latin character recognition
  const ocrResult = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {} // quiet in production
  });

  const extractedText = ocrResult?.data?.text || '';
  const parsedData = parseKKText(extractedText);

  return {
    success: true,
    data: parsedData,
    extractedTextPreview: extractedText.slice(0, 300)
  };
}
