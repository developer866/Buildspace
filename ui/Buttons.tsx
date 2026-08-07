interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
}

const Button = ({
  text,
  onClick,
  variant = "primary",
  type = "button",
}: ButtonProps) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
      type={type}
    >
      {text}
    </button>
  );
};

export default Button;