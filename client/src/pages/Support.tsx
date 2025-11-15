import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Support() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to contact page
    setLocation("/contact");
  }, [setLocation]);

  return null;
}
