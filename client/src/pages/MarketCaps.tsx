// The market cap options as constants to ensure we don't have JSX parsing issues
export const MARKET_CAP_OPTIONS = [
  { value: "", label: "Any Size" },
  { value: "large", label: "Large Cap (>$10B)" },
  { value: "medium", label: "Mid Cap ($2-10B)" },
  { value: "small", label: "Small Cap ($300M-2B)" },
  { value: "micro", label: "Micro Cap (<$300M)" }
];
