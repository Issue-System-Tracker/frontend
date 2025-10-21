"use client";

interface TextInputProps {
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

export default function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}: TextInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      className={`w-full px-4 py-2 rounded-md bg-gray-100 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black ${className}`}
    />
  );
}
