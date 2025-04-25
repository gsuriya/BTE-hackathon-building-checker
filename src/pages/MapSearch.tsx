
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Map as MapIcon } from "lucide-react";
import AddressSearch from '@/components/AddressSearch';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapSearch = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  // Handle mapbox token input
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('mapboxToken') as string;
    
    if (token) {
      setMapboxToken(token);
      localStorage.setItem('mapbox_token', token);
    }
  };
  
  // Initialize map when token is available
  useEffect(() => {
    // Check for token in localStorage first
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
    
    if (!mapboxToken || !mapContainer.current || map.current) return;
    
    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.9857, 40.7484], // New York City coordinates
        zoom: 12
      });
      
      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });
      
      // Cleanup function
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [mapboxToken]);
  
  const handleAddressSearch = async (address: string) => {
    if (!map.current || !mapLoaded) return;
    
    // In a real app, you'd geocode the address to get coordinates
    // For now, just simulate by focusing on NYC
    map.current.flyTo({
      center: [-73.9857, 40.7484],
      zoom: 14,
      essential: true
    });
    
    // Add a marker for demonstration
    new mapboxgl.Marker()
      .setLngLat([-73.9857, 40.7484])
      .addTo(map.current);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">NYC Building Checker</Link>
          <Link to="/" className="text-sm hover:underline">Back to Home</Link>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <MapIcon className="h-8 w-8" />
          Find Buildings on the Map
        </h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <Card className="overflow-visible">
            <CardContent className="p-6">
              <AddressSearch />
            </CardContent>
          </Card>
        </div>
        
        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {!mapboxToken ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Enter your Mapbox access token</h3>
              <p className="text-gray-600 mb-6">
                To use the map feature, please enter your Mapbox public access token. 
                You can get one for free at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
              </p>
              <form onSubmit={handleTokenSubmit} className="flex flex-col items-center gap-4">
                <input 
                  type="text" 
                  name="mapboxToken"
                  placeholder="Enter your Mapbox public token"
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
                />
                <Button type="submit">Save Token & Load Map</Button>
              </form>
            </div>
          ) : (
            <div className="h-[600px] relative">
              <div ref={mapContainer} className="absolute inset-0" />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">How to use the map search</h3>
            <ol className="list-decimal ml-5 space-y-2 text-gray-700">
              <li>Enter a specific NYC address in the search bar above</li>
              <li>The map will zoom to the location and show nearby buildings</li>
              <li>Click on any building marker to see its details and issues report</li>
              <li>Use the navigation controls to explore the neighborhood</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapSearch;
