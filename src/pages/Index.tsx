import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Database, Home, MapPin, Search, Star, Map } from "lucide-react";
import AddressSearch from '@/components/AddressSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';

const Index = () => {
  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Find Your Perfect NYC Apartment Without Surprises
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  Discover potential building issues before signing your lease. Get comprehensive reports on pest problems, maintenance issues, and more.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/map-search">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-black/20 z-10 rounded-lg" />
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267')] bg-cover bg-center rounded-lg transform scale-105" />
              <div className="absolute bottom-6 right-6 z-20 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg">
                <div className="flex gap-2 items-center text-blue-700">
                  <Star className="h-5 w-5 fill-yellow-400 stroke-yellow-500" />
                  <span className="font-semibold">Livability Score:</span>
                  <span className="text-green-600 font-bold">9.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="container px-4 md:px-6 py-12 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Why Choose Our Platform?</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            We help you avoid unpleasant surprises by providing detailed information about potential rentals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Building History Reports</h3>
            <p className="text-gray-500">Get detailed reports on building violations and complaints.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Real NYC Data</h3>
            <p className="text-gray-500">All reports backed by official NYC housing data.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Livability Scores</h3>
            <p className="text-gray-500">Visual ratings based on issue severity and frequency.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Interactive Maps</h3>
            <p className="text-gray-500">Visualize problem areas and find better neighborhoods.</p>
          </div>
        </div>
      </section>

      {/* Student Section */}
      <section className="container px-4 md:px-6 py-12 mx-auto bg-blue-50 rounded-2xl my-12">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3 space-y-4">
            <div className="inline-block bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium text-sm mb-2">
              FOR STUDENTS
            </div>
            <h2 className="text-3xl font-bold">Finding Student Housing?</h2>
            <p className="text-gray-600 max-w-2xl">
              We specialize in helping students find safe, reliable housing near campus. Get insights from other students who've lived there before you sign that lease.
            </p>
            <div className="pt-4">
              <Button className="bg-blue-600">
                Student Housing Guide
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="font-bold text-green-600">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">John D.</h4>
                  <p className="text-sm text-gray-500">NYU Student</p>
                </div>
                <div className="ml-auto flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 stroke-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm italic">
                "This site saved me from signing a lease at a building with chronic heat issues. The apartment looked great in photos but had terrible reviews!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container px-4 md:px-6 py-12 mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect apartment?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start searching now and discover the real story behind that rental listing.
          </p>
          <Link to="/map-search">
            <Button className="bg-blue-600 h-12 px-8">
              Search Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
