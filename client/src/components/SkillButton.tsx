import { cn } from "@/lib/utils";

interface SkillButtonProps {
  name: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SkillButton = ({ name, selected = false, onClick, className }: SkillButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium",
        selected 
          ? "bg-primary-100 text-primary-800" 
          : "bg-gray-100 text-gray-800",
        "hover:opacity-90 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default SkillButton;
