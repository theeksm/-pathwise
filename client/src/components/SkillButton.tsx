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
          ? "bg-blue-200 text-blue-800 border border-blue-300" 
          : "bg-gray-100 text-gray-800 border border-transparent",
        "hover:opacity-90 transition-all",
        className
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default SkillButton;
