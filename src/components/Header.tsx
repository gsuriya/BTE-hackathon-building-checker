
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Map, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Map className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-white">NYC Building Checker</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-neutral-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/map-search" className="text-neutral-300 hover:text-white transition-colors">
            Map Search
          </Link>
          <Link to="/results" className="text-neutral-300 hover:text-white transition-colors">
            Results
          </Link>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white ml-4">
            Get Started
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden text-neutral-300">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
