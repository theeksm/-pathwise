import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  platform: string;
  cost: string;
  duration: string;
  skillName: string;
  isMissing: boolean;
  tags: string[];
  onStartCourse?: () => void;
  onShowMoreOptions?: () => void;
}

const CourseCard = ({
  title,
  platform,
  cost,
  duration,
  skillName,
  isMissing,
  tags,
  onStartCourse,
  onShowMoreOptions
}: CourseCardProps) => {
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="px-4 py-5 flex items-center justify-between border-b">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{skillName}</h4>
          <span className={`px-2.5 py-0.5 mt-1 inline-block rounded-full text-xs font-medium ${isMissing ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {isMissing ? 'Missing 🔴' : 'Present ✅'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-5">
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium">💬 AI Tip:</span> "{isMissing ? `A must-have skill for your target career.` : `You already have this skill - consider advanced courses.`}"
        </p>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">Title: {title}</div>
          <div className="text-sm text-gray-500">Platform: {platform}</div>
          <div className="text-sm text-gray-500">Cost: {cost}</div>
          <div className="text-sm text-gray-500">Duration: {duration}</div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-4 bg-gray-50 border-t flex flex-col items-start space-y-4">
        <div className="flex items-center space-x-2">
          <Button onClick={onStartCourse}>Start Course</Button>
          <Button variant="link" onClick={onShowMoreOptions}>More Options</Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-primary-100 text-primary-800 border-primary-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
