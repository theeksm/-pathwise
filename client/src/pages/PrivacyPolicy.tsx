import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-3xl font-bold text-center dark:text-white">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Introduction</h2>
                <p className="dark:text-gray-300">
                  This Privacy Policy explains how PathWise ("we", "us", or "our") collects, uses, and protects your 
                  information when you use our AI Career Platform at <a href="https://pathwise.replit.app" className="text-blue-600 dark:text-blue-400 hover:underline">https://pathwise.replit.app</a> 
                  (the "Service").
                </p>
                <p className="dark:text-gray-300">
                  PathWise is an educational/student-led project currently in development, focused on helping users 
                  explore career paths using AI technology, analyze their skills, and match with potential job opportunities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Information We Collect</h2>
                <p className="dark:text-gray-300">
                  We collect the following types of information:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>
                    <strong>Account Information:</strong> When you register using Google authentication, we collect basic 
                    account information such as your name, email address, and profile photo.
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Information you provide in your user profile, including professional 
                    background, skills, and career preferences.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you interact with our Service, including career 
                    paths you explore, skills you analyze, and job matches you review.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">How We Use Your Information</h2>
                <p className="dark:text-gray-300">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Personalize career recommendations and job matches</li>
                  <li>Analyze your skills and suggest development opportunities</li>
                  <li>Communicate with you about your account and provide support</li>
                  <li>Enhance the security and functionality of our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Data Sharing and Disclosure</h2>
                <p className="dark:text-gray-300">
                  <strong>We do not sell or share your personal information with third parties for marketing purposes.</strong>
                </p>
                <p className="dark:text-gray-300">
                  Your information may be processed by third-party service providers that help us operate our platform, such as 
                  cloud hosting providers and authentication services. These providers are contractually obligated to use your 
                  information only for the purposes of providing services to us.
                </p>
                <p className="dark:text-gray-300">
                  We may also disclose your information if required by law or if we believe in good faith that such action is 
                  necessary to comply with legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Data Security</h2>
                <p className="dark:text-gray-300">
                  We implement reasonable security measures to protect your personal information from unauthorized access, 
                  alteration, disclosure, or destruction. However, as this is an educational project in development, we cannot 
                  guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Educational Project Status</h2>
                <p className="dark:text-gray-300">
                  PathWise is an educational/student-led project in development. Data practices may evolve as the platform 
                  develops. We are committed to maintaining transparency about our data practices and will update this 
                  Privacy Policy accordingly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Your Rights</h2>
                <p className="dark:text-gray-300">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of certain data processing activities</li>
                </ul>
                <p className="dark:text-gray-300">
                  To exercise these rights, please contact us at the email provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Changes to This Privacy Policy</h2>
                <p className="dark:text-gray-300">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                  Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Contact Us</h2>
                <p className="dark:text-gray-300">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="dark:text-gray-300 font-semibold">
                  pathwise.support@example.com
                </p>
              </section>

              <p className="text-sm dark:text-gray-400 pt-6">
                Last Updated: April 14, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;