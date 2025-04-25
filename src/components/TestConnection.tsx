import { useEffect, useState } from 'react';
import { getSampleAddresses } from '@/integrations/supabase/client';

export default function TestConnection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const data = await getSampleAddresses();
        setAddresses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      }
    }

    fetchAddresses();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sample Addresses</h2>
      <div className="space-y-2">
        {addresses.map((address, index) => (
          <div key={index} className="p-2 border rounded">
            <p>{address['House Number']} {address['Street Name']}</p>
            <p className="text-sm text-gray-600">{address.Borough}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 