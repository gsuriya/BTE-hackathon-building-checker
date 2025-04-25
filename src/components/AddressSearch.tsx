import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Require more specific address input with a minimum length
const searchSchema = z.object({
  address: z.string()
    .min(5, "Please enter a specific address (e.g. '123 Main St' or '10 Central Park West')")
    .refine(val => {
      // Check if input likely contains a street number and name
      // This regex looks for a pattern like "123 Main St" or variations
      return /\d+\s+[a-zA-Z0-9\s]+/.test(val);
    }, "Please include a building number and street name")
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface AddressSearchProps {
  onSearch?: (address: string) => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      address: "",
    },
  });

  const onSubmit = async (values: SearchFormValues) => {
    setIsSearching(true);
    
    try {
      // Clean up the address (remove extra spaces, standardize format)
      const cleanedAddress = values.address.trim()
        .replace(/\s+/g, ' ')  // Standardize spaces
        .replace(/,\s*/g, ', '); // Standardize commas
      
      // Validate that the address likely contains a house number
      if (!/\d+/.test(cleanedAddress)) {
        toast({
          title: "More Specific Address Needed",
          description: "Please include a building number in your search (e.g. '123 Main St')",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      // Call the onSearch prop if provided
      if (onSearch) {
        await onSearch(cleanedAddress);
      } else {
        // Default behavior - navigate to results page
        const encodedAddress = encodeURIComponent(cleanedAddress);
        navigate(`/results?address=${encodedAddress}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Unable to process your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="Enter specific address (e.g. 123 Main St, Brooklyn)" 
                    {...field} 
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="h-12" 
            disabled={isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Search requires a specific address with building number (e.g. "125 West 57th St" or "350 5th Ave")
        </div>
      </form>
    </Form>
  );
};

export default AddressSearch;
