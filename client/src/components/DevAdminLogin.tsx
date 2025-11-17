import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, User } from "lucide-react";

export default function DevAdminLogin() {
  const [email, setEmail] = useState("admin@test.com");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDevLogin = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      // In a real app, this would go through your OAuth/auth system
      // For testing, we'll simulate admin login
      const response = await fetch("/api/dev/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setMessage("✅ Admin login successful! Refreshing...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage("❌ Login failed. Make sure test admin exists.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Login error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Development Login</CardTitle>
          <p className="text-gray-600">Quick access for testing admin features</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Admin Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleDevLogin}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Login as Admin
              </>
            )}
          </Button>
          
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p>Development Mode Only</p>
            <p>Creates test admin user automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}