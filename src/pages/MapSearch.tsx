import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Map as MapIcon, AlertTriangle, ArrowRight } from "lucide-react";
import AddressSearch from '@/components/AddressSearch';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "../lib/supabase";
import { searchExactAddress, searchFuzzyAddress } from "@/utils/building/searchQueries";
import { parseAddress } from "@/utils/address/parseAddress";

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3N1cml5YSIsImEiOiJjbTl3N2hkMHkwdDF6Mm1vbGJ1YmN2a3o2In0.w3TtonBpK0Ipq4-Y_TAlxA';

interface BuildingIssue {
  "House Number": string;
  "Street Name": string;
  Borough: string;
  "Complaint Type"?: string;
  "Complaint Category"?: string;
  Status?: string;
  Apartment?: string;
  BBL?: string;
  BIN?: string;
  Block?: string;
  "Building ID"?: string;
  "Census Tract"?: string;
  "Community Board"?: string;
  "Complaint ID"?: string;
  [key: string]: any;
}

const MapSearch = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<BuildingIssue[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingIssue | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('nyc_housing_data')
          .select('"House Number", "Street Name", Borough') // Select only necessary columns
          .limit(10); // Fetch first 10 records

        if (error) {
          console.error('Supabase connection error:', error);
          setError('Database connection failed');
          return;
        }

        console.log('✅ Supabase connection successful');
        if (data && data.length > 0) {
          console.log(`Sample Addresses for Testing (First ${data.length}):`);
          data.forEach((record, index) => {
            console.log(
              `  ${index + 1}. ${record["House Number"]} ${record["Street Name"]}, ${record.Borough}`
            );
          });
          // console.log('  (Full record list):', data); // Optionally log the full array
        } else {
          console.log('No sample data returned from test query.');
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        setError('Database connection failed');
      }
    };

    testConnection();
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      console.log('Initializing Mapbox...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-73.9857, 40.7484],
        zoom: 12
      });
      
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      map.current.on('load', () => {
        console.log('✅ Mapbox loaded successfully');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Map failed to load');
      });
      
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setError('Map failed to load');
    }
  }, []);
  
  const handleAddressSearch = async (address: string) => {
    if (!map.current || !mapLoaded) return;
    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedBuilding(null);
    
    try {
      const addressParts = parseAddress(address);
      if (!addressParts) {
        setError('Could not parse address. Please use format: "123 Main St"');
        return;
      }

      // Try exact match first
      let results = await searchExactAddress(addressParts.houseNumber, addressParts.streetName);
      
      // If no exact matches, try fuzzy search
      if (!results || results.length === 0) {
        results = await searchFuzzyAddress(addressParts.houseNumber, addressParts.streetName);
      }

      if (!results || results.length === 0) {
        setError('No building records found for this address');
        return;
      }

      setSearchResults(results);
      setSelectedBuilding(results[0]);

      // Geocode the address using Mapbox
      const geocodeResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.features && geocodeData.features.length > 0) {
        const [longitude, latitude] = geocodeData.features[0].center;
        
        // Update map view to the actual location
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          essential: true
        });

        // Add marker at the actual location
        new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map.current);
      } else {
        console.warn('Could not find location on map');
      }

    } catch (err) {
      console.error('Error handling address search:', err);
      setError('Failed to search for building data');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
          <MapIcon className="h-8 w-8 text-emerald-500" />
          Find Buildings on the Map
        </h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <AddressSearch onSearch={handleAddressSearch} />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="glass-card mb-6">
              <div className="h-[600px] relative">
                <div ref={mapContainer} className="absolute inset-0 rounded-xl overflow-hidden" />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-neutral-400">Loading map...</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute top-4 left-4 right-4 bg-red-900/90 text-white px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {isSearching ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Searching...</p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedBuilding ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedBuilding["House Number"]} {selectedBuilding["Street Name"]}
                      </h3>
                      <p className="text-neutral-400">{selectedBuilding.Borough}</p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/results?address=${encodeURIComponent(
                      `${selectedBuilding["House Number"]} ${selectedBuilding["Street Name"]}`
                    )}&borough=${encodeURIComponent(selectedBuilding.Borough)}`}
                    className="w-full"
                  >
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                    >
                      See Full Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MapSearch;
