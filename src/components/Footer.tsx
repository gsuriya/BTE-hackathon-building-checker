import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-12 text-neutral-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Map className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-xl font-bold text-white">Bellam Building Checker</span>
            </div>
            <p className="text-sm">
              Making apartment hunting in New York City transparent and stress-free.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Building Reports</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Map Search</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Livability Scores</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Student Housing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-3 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">Subscribe to our newsletter</h3>
            <p className="text-sm mb-4">Stay updated on new features and NYC housing insights.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-neutral-800 border border-neutral-700 rounded-l-lg px-4 py-2 text-white flex-1"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-r-lg">
                Subscribe
              </button>
            </div>
            
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-neutral-500 hover:text-emerald-500 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-emerald-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Bellam Building Checker. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
