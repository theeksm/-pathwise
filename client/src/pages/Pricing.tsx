import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Pricing = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Choose the perfect plan to accelerate your career growth
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full mb-12">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Basic career exploration</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Career path exploration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic skill gap analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Limited AI chat assistance (5 messages/day)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Market trends dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  No credit card required
                </p>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary-200 shadow-md relative">
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>
                  Advanced career development tools
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Free</span>, plus:
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Complete AI-powered resume optimization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced skill gap analysis with learning paths</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited AI career coach messages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized job matching</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Career progress tracking dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  Start Pro Trial
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  7-day free trial, cancel anytime
                </p>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Pro</span>, plus:
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Team collaboration features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom industry analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">HR integration options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Custom plans available
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="annual" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan (Annual) */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Basic career exploration</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500 ml-1">/year</span>
                </div>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Career path exploration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic skill gap analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Limited AI chat assistance (5 messages/day)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Market trends dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  No credit card required
                </p>
              </CardFooter>
            </Card>

            {/* Pro Plan (Annual) */}
            <Card className="border-primary-200 shadow-md relative">
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>
                  Advanced career development tools
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$15</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Save $48 per year
                </p>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Free</span>, plus:
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Complete AI-powered resume optimization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced skill gap analysis with learning paths</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited AI career coach messages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized job matching</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Career progress tracking dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  Start Pro Trial
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  7-day free trial, billed annually ($180/year)
                </p>
              </CardFooter>
            </Card>

            {/* Enterprise Plan (Annual) */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$39</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Save $120 per year
                </p>
              </CardHeader>
              <CardContent className="pb-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Pro</span>, plus:
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Team collaboration features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom industry analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">HR integration options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Billed annually ($468/year)
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-12" />

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          Compare Plan Features
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Free
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pro
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Career Path Guidance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Advanced
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Custom
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Skill Gap Analysis
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Advanced
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Advanced + Team Analysis
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Resume Optimization
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI Career Coach
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  5 messages/day
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Unlimited
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Unlimited + Priority
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Job Matching
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Personalized
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Enterprise Connections
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Market Trends
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Custom Industry Reports
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Entrepreneurship Advisor
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span> + Custom Analysis
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Learning Path Recommendations
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Personalized
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Custom + Team Learning
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Team Collaboration
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-500">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          For educational institutions, government agencies, or large
          organizations, we offer custom pricing and features. Contact our sales
          team to learn more.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="font-medium">Can I cancel my subscription anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. If you cancel,
              you'll still have access to your plan until the end of your billing
              period.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">How does the free trial work?</h3>
            <p className="text-sm text-gray-600">
              Our 7-day free trial gives you full access to all Pro features. No
              credit card is required for the free plan, but you'll need to
              provide payment details for Pro or Enterprise trials.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Can I switch plans later?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. When
              upgrading, you'll get immediate access to new features. When
              downgrading, changes take effect at the end of your billing cycle.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Do you offer educational discounts?</h3>
            <p className="text-sm text-gray-600">
              Yes, we offer special discounts for students, educational
              institutions, and non-profit organizations. Contact our sales team
              for more information.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-600">
              We accept all major credit cards (Visa, MasterCard, American
              Express), PayPal, and offer invoice payment options for Enterprise
              customers.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Is my data secure?</h3>
            <p className="text-sm text-gray-600">
              Yes, we take data security seriously. We use industry-standard
              encryption and never share your personal information with third
              parties without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
