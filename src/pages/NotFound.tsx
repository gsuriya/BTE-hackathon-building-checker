
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950">
      <div className="text-center space-y-6">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Map className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-neutral-400">Oops! Page not found</p>
        <Link to="/">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mt-4">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
