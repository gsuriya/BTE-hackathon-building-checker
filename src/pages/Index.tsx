
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Building, Database, Home, MapPin, Search, Star, Map, Check } from "lucide-react";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-950 to-neutral-900">
      <Header />

      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-2">
                  <Check className="mr-1 h-4 w-4" /> Trusted by 10,000+ NYC renters
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
                  Find Your <span className="text-emerald-500">Perfect Apartment</span> Without Surprises
                </h1>
                <p className="max-w-[600px] text-xl text-neutral-400 md:text-2xl">
                  Discover potential building issues before signing your lease. Get comprehensive reports on past problems.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/map-search">
                  <Button size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600 text-lg px-8 py-6 h-auto font-semibold">
                    Get Started
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-emerald-500 text-emerald-500 hover:bg-emerald-950 text-lg px-8 py-6 h-auto font-semibold"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
              <div className="absolute inset-0 bg-black/30 z-10 rounded-2xl backdrop-blur-sm" />
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267')] bg-cover bg-center rounded-2xl transform scale-105 transition-all duration-1000 hover:scale-110" />
              <div className="absolute bottom-6 right-6 z-20 bg-neutral-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-neutral-800">
                <div className="flex gap-2 items-center">
                  <Star className="h-5 w-5 fill-emerald-500 stroke-emerald-600" />
                  <span className="font-semibold text-neutral-200">Livability Score:</span>
                  <span className="text-emerald-500 font-bold">9.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="container px-4 md:px-6 py-16 md:py-24 mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-2">
            POWERFUL FEATURES
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
          <p className="text-neutral-400 mx-auto max-w-2xl">
            We help you avoid unpleasant surprises by providing detailed insights about potential rentals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-neutral-800/50 p-8 rounded-2xl shadow-md border border-neutral-700 hover:border-emerald-500 transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-5">
              <Building className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-xl mb-3 text-white">Building History Reports</h3>
            <p className="text-neutral-400">Get detailed reports on building violations and complaints from official NYC records.</p>
          </div>
          <div className="bg-neutral-800/50 p-8 rounded-2xl shadow-md border border-neutral-700 hover:border-emerald-500 transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-5">
              <Database className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-xl mb-3 text-white">Real NYC Data</h3>
            <p className="text-neutral-400">All reports backed by official NYC housing and building department data.</p>
          </div>
          <div className="bg-neutral-800/50 p-8 rounded-2xl shadow-md border border-neutral-700 hover:border-emerald-500 transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-5">
              <Star className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-xl mb-3 text-white">Livability Scores</h3>
            <p className="text-neutral-400">Visual ratings based on issue severity, frequency, and management response time.</p>
          </div>
          <div className="bg-neutral-800/50 p-8 rounded-2xl shadow-md border border-neutral-700 hover:border-emerald-500 transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-5">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-xl mb-3 text-white">Interactive Maps</h3>
            <p className="text-neutral-400">Visualize problem areas and find better neighborhoods based on historical data.</p>
          </div>
        </div>
      </section>

      {/* Student Section */}
      <section className="container px-4 md:px-6 py-16 mx-auto">
        <div className="grid md:grid-cols-5 gap-8 items-center bg-neutral-800/50 p-8 rounded-2xl border border-neutral-700 shadow-xl">
          <div className="md:col-span-3 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-2">
              FOR STUDENTS
            </div>
            <h2 className="text-3xl font-bold text-white">Finding Student Housing?</h2>
            <p className="text-neutral-400 max-w-2xl">
              We specialize in helping students find safe, reliable housing near campus. Get insights from other students who've lived there before you sign that lease.
            </p>
            <div className="pt-4">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Student Housing Guide
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-neutral-900 p-6 rounded-xl shadow-lg border border-neutral-800">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-700">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="font-bold text-emerald-500">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">John D.</h4>
                  <p className="text-sm text-neutral-500">NYU Student</p>
                </div>
                <div className="ml-auto flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-emerald-500 stroke-emerald-600" />
                  ))}
                </div>
              </div>
              <p className="text-neutral-400 text-sm italic">
                "This site saved me from signing a lease at a building with chronic heat issues. The apartment looked great in photos but had terrible reviews!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container px-4 md:px-6 py-16 mx-auto">
        <div className="text-center bg-gradient-to-r from-emerald-900/30 to-neutral-900/80 py-16 px-8 rounded-2xl border border-neutral-800">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to find your perfect apartment?</h2>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Start searching now and discover the real story behind that rental listing.
          </p>
          <Link to="/map-search">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-lg">
              Search Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
