"use client";

interface TextInputProps {
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  multiline?: boolean;
  rows?: number;
  label?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export default function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  multiline = false,
  rows = 3,
  label,
  required = false,
  minLength,
  maxLength,
}: TextInputProps) {
  const inputClasses = `w-full px-4 py-2 rounded-md bg-gray-100 text-black transition-color duration-150 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={rows}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}
    </div>
  );
}
