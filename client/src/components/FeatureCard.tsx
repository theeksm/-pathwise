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
    <div className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={path}>
        <a className="block p-6">
          <div className="text-primary-600 mb-4">
            <Icon className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-base text-gray-500">{description}</p>
        </a>
      </Link>
    </div>
  );
};

export default FeatureCard;
