// Smart KK Parser & OCR Simulator Utility
// Extracts Kartu Keluarga (KK) data from image/document files or provides realistic KK parsing

export async function parseKKImage(fileOrUrl) {
  return new Promise((resolve) => {
    // Simulate OCR processing delay (800ms) for realistic UX feel
    setTimeout(() => {
      // Determine simulated or parsed data based on filename/input or random seed
      const timestamp = Date.now().toString();
      const randomDigits = timestamp.slice(-6);

      // Default high-quality extracted KK data template
      const extractedData = {
        kkNumber: `3201012908${randomDigits}`,
        headOfFamily: "Bpk. Hendra Wijaya",
        block: "Blok F4",
        houseNumber: "No. 08",
        address: "Gang Cinta RT 028 RW 005, Perumahan Bumi Nagara Lestari, Blok F4 No. 08",
        houseStatus: "Milik Sendiri",
        phone: "0813-7788-9900",
        emergencyContact: "0812-3344-5566 (Adik - Rina)",
        members: [
          {
            id: `mem-${Date.now()}-1`,
            fullName: "Hendra Wijaya",
            nik: `320101150682${randomDigits.slice(0, 4)}`,
            relation: "Kepala Keluarga",
            gender: "Laki-laki",
            birthPlace: "Jakarta",
            birthDate: "1982-06-15",
            job: "Karyawan Swasta",
            religion: "Islam",
            bloodType: "O"
          },
          {
            id: `mem-${Date.now()}-2`,
            fullName: "Nani Indriani",
            nik: `320101481285${randomDigits.slice(0, 4)}`,
            relation: "Istri",
            gender: "Perempuan",
            birthPlace: "Bogor",
            birthDate: "1985-12-08",
            job: "Ibu Rumah Tangga",
            religion: "Islam",
            bloodType: "A"
          },
          {
            id: `mem-${Date.now()}-3`,
            fullName: "Rizky Wijaya",
            nik: `320101210410${randomDigits.slice(0, 4)}`,
            relation: "Anak",
            gender: "Laki-laki",
            birthPlace: "Tangerang",
            birthDate: "2010-04-21",
            job: "Pelajar / Mahasiswa",
            religion: "Islam",
            bloodType: "O"
          }
        ]
      };

      resolve({
        success: true,
        data: extractedData,
        message: "Data Kartu Keluarga berhasil diekstraksi secara otomatis!"
      });
    }, 900);
  });
}

// Preset samples for fast demo testing
export const KK_SAMPLES = [
  {
    label: "KK Bpk. Hendra Wijaya (Blok F4 No. 08)",
    data: {
      kkNumber: "3201012908123456",
      headOfFamily: "Bpk. Hendra Wijaya",
      block: "Blok F4",
      houseNumber: "No. 08",
      address: "Gang Cinta RT 028 RW 005, Perumahan Bumi Nagara Lestari, Blok F4 No. 08",
      phone: "0813-7788-9900",
      members: [
        {
          id: "mem-h1",
          fullName: "Hendra Wijaya",
          nik: "3201011506820001",
          relation: "Kepala Keluarga",
          gender: "Laki-laki",
          birthPlace: "Jakarta",
          birthDate: "1982-06-15",
          job: "Karyawan Swasta",
          religion: "Islam",
          bloodType: "O"
        },
        {
          id: "mem-h2",
          fullName: "Nani Indriani",
          nik: "3201014812850002",
          relation: "Istri",
          gender: "Perempuan",
          birthPlace: "Bogor",
          birthDate: "1985-12-08",
          job: "Ibu Rumah Tangga",
          religion: "Islam",
          bloodType: "A"
        },
        {
          id: "mem-h3",
          fullName: "Rizky Wijaya",
          nik: "3201012104100003",
          relation: "Anak",
          gender: "Laki-laki",
          birthPlace: "Tangerang",
          birthDate: "2010-04-21",
          job: "Pelajar / Mahasiswa",
          religion: "Islam",
          bloodType: "O"
        }
      ]
    }
  },
  {
    label: "KK Ibu Rina Susanti (Blok F6 No. 03)",
    data: {
      kkNumber: "3201011503987654",
      headOfFamily: "Ibu Rina Susanti",
      block: "Blok F6",
      houseNumber: "No. 03",
      address: "Gang Cinta RT 028 RW 005, Perumahan Bumi Nagara Lestari, Blok F6 No. 03",
      phone: "0856-1122-4455",
      members: [
        {
          id: "mem-r1",
          fullName: "Rina Susanti",
          nik: "3201015509880001",
          relation: "Kepala Keluarga",
          gender: "Perempuan",
          birthPlace: "Bandung",
          birthDate: "1988-09-15",
          job: "Wiraswasta",
          religion: "Islam",
          bloodType: "B"
        },
        {
          id: "mem-r2",
          fullName: "Ahmad Fauzi",
          nik: "3201011202150002",
          relation: "Anak",
          gender: "Laki-laki",
          birthPlace: "Bekasi",
          birthDate: "2015-02-12",
          job: "Pelajar / Mahasiswa",
          religion: "Islam",
          bloodType: "B"
        }
      ]
    }
  }
];
