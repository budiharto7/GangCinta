// Central Utility for formatting Rupiah currency amounts cleanly & consistently
export function formatRupiah(num, prefix = "") {
  if (num === null || num === undefined || isNaN(num)) {
    return prefix === "+" ? "+Rp 0" : (prefix === "-" ? "-Rp 0" : "Rp 0");
  }
  const numericVal = Number(num);
  const val = Math.abs(numericVal);
  const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  if (prefix === "+") return `+Rp ${formatted}`;
  if (prefix === "-") return `-Rp ${formatted}`;
  if (numericVal < 0) return `-Rp ${formatted}`;
  return `Rp ${formatted}`;
}

export function formatRupiahParts(num, prefix = "") {
  if (num === null || num === undefined || isNaN(num)) {
    const symbol = prefix === "+" ? "+Rp" : (prefix === "-" ? "-Rp" : "Rp");
    return { symbol, digits: "0" };
  }
  const numericVal = Number(num);
  const val = Math.abs(numericVal);
  const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  let symbol = "Rp";
  if (prefix === "+") symbol = "+Rp";
  else if (prefix === "-") symbol = "-Rp";
  else if (numericVal < 0) symbol = "-Rp";

  return { symbol, digits: formatted };
}
