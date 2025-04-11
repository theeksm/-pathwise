import { Link } from "wouter";
import Logo from "@/assets/logo";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center text-white">
              <Logo className="h-8 w-auto text-primary-400" />
              <span className="ml-2 text-xl font-bold">PathWise</span>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              AI-powered career guidance platform that helps you navigate your professional journey with confidence.
            </p>
            <div className="mt-6">
              <Link href="/contact">
                <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md dark:bg-blue-500 dark:hover:bg-blue-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Features
            </h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/career-path" className="text-base text-gray-400 hover:text-white">Career Path Guidance</Link></li>
              <li><Link href="/skill-gap" className="text-base text-gray-400 hover:text-white">Skill Gap Analyzer</Link></li>
              <li><Link href="/resume-optimizer" className="text-base text-gray-400 hover:text-white">Resume Optimizer</Link></li>
              <li><Link href="/job-matching" className="text-base text-gray-400 hover:text-white">Job Matching</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/blog" className="text-base text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link href="/market-trends" className="text-base text-gray-400 hover:text-white">Market Trends</Link></li>
              <li><Link href="/guides" className="text-base text-gray-400 hover:text-white">Career Guides</Link></li>
              <li><Link href="/resources" className="text-base text-gray-400 hover:text-white">Learning Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Contact Info
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">support@pathwise.example.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">123 Career Avenue, Suite 200<br />San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} PathWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
