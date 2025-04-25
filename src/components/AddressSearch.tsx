
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const searchSchema = z.object({
  address: z.string().min(1, "Address is required")
});

type SearchFormValues = z.infer<typeof searchSchema>;

const AddressSearch = () => {
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
      // Encode the address for URL safety
      const encodedAddress = encodeURIComponent(values.address.trim());
      
      // Navigate to the results page with the address as a parameter
      navigate(`/results?address=${encodedAddress}`);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Unable to process your search. Please try again.",
        variant: "destructive",
      });
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
                    placeholder="Enter NYC address (e.g., 123 Main St, Brooklyn or just a borough)" 
                    {...field} 
                    className="h-12"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="h-12" 
            disabled={isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Search by street address, building name, neighborhood or borough.
        </div>
      </form>
    </Form>
  );
};

export default AddressSearch;
