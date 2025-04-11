import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

const FeatureCard = ({ icon: Icon, title, description, path }: FeatureCardProps) => {
  return (
    <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={path}>
        <div className="block p-6 cursor-pointer">
          <div className="text-primary-600 dark:text-blue-400 mb-4">
            <Icon className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-300">{description}</p>
        </div>
      </Link>
    </div>
  );
};

export default FeatureCard;
