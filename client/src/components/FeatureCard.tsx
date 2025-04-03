import { Link } from "wouter";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
}

const FeatureCard = ({ icon, title, description, path }: FeatureCardProps) => {
  return (
    <Link href={path}>
      <a className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="text-primary-600 text-3xl mb-4">{icon}</div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-base text-gray-500">{description}</p>
        </div>
      </a>
    </Link>
  );
};

export default FeatureCard;
