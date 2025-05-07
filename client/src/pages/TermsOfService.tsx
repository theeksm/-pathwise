import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-3xl font-bold text-center dark:text-white">
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Introduction</h2>
                <p className="dark:text-gray-300">
                  Welcome to PathWise ("we", "us", or "our"). By accessing or using our AI Career Platform at 
                  <a href="https://pathwise.replit.app" className="text-blue-600 dark:text-blue-400 hover:underline"> https://pathwise.replit.app</a> 
                  (the "Service"), you agree to be bound by these Terms of Service.
                </p>
                <p className="dark:text-gray-300">
                  PathWise is an educational/student-led project in development that aims to help users explore career paths, analyze skills, 
                  and match with potential job opportunities using AI technology.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Acceptable Use</h2>
                <p className="dark:text-gray-300">
                  By using PathWise, you agree to:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>Use the Service for personal career exploration and development purposes only</li>
                  <li>Provide accurate information when creating your profile</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <p className="dark:text-gray-300">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to access another user's account without permission</li>
                  <li>Use automated means to access or collect data from the Service</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Distribute, license, or sell data obtained from the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">AI-Generated Content</h2>
                <p className="dark:text-gray-300">
                  PathWise uses artificial intelligence to provide career recommendations, skill analyses, and job matches. 
                  You acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>AI-generated suggestions are for informational purposes only and should not replace professional career advice</li>
                  <li>We do not guarantee the accuracy, completeness, or usefulness of AI-generated content</li>
                  <li>You are solely responsible for any decisions or actions you take based on the information provided</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">User Accounts</h2>
                <p className="dark:text-gray-300">
                  When you create an account, you are responsible for:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                </ul>
                <p className="dark:text-gray-300">
                  We reserve the right to terminate or suspend accounts that violate these Terms of Service or engage in activities that 
                  could harm other users or the Service itself.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Educational Project Status</h2>
                <p className="dark:text-gray-300">
                  PathWise is an educational/student-led project in development. As such:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300">
                  <li>The Service may undergo significant changes as development progresses</li>
                  <li>We do not guarantee uninterrupted or error-free operation</li>
                  <li>Features and functionality may be added, modified, or removed without notice</li>
                  <li>We may periodically take the Service offline for maintenance or updates</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Intellectual Property</h2>
                <p className="dark:text-gray-300">
                  All content provided by PathWise, including but not limited to text, graphics, logos, icons, images, audio clips, 
                  digital downloads, and software, is the property of PathWise or its content providers and is protected by applicable 
                  intellectual property laws.
                </p>
                <p className="dark:text-gray-300">
                  You may not use, reproduce, distribute, or create derivative works from this content without express written permission 
                  from PathWise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Limitation of Liability</h2>
                <p className="dark:text-gray-300">
                  To the fullest extent permitted by applicable law, PathWise and its affiliates shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, or any loss of profits or revenue, whether incurred directly 
                  or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of 
                  the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Changes to Terms</h2>
                <p className="dark:text-gray-300">
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting 
                  to the Service. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms 
                  of Service.
                </p>
                <p className="dark:text-gray-300">
                  It is your responsibility to review these Terms of Service periodically for changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold dark:text-white">Contact Us</h2>
                <p className="dark:text-gray-300">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="dark:text-gray-300 font-semibold">
                  pathwiseforeducation@gmail.com
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

export default TermsOfService;