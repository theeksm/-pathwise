import { useState } from "react";
import { ConfirmationResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PhoneVerificationProps {
  confirmationResult: ConfirmationResult;
  onVerificationComplete: () => void;
  onCancel: () => void;
}

const PhoneVerification = ({
  confirmationResult,
  onVerificationComplete,
  onCancel,
}: PhoneVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter a valid verification code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await confirmationResult.confirm(verificationCode);
      toast({
        title: "Verification successful",
        description: "Your phone number has been verified.",
      });
      onVerificationComplete();
    } catch (error: any) {
      setError(error.message || "Invalid verification code. Please try again.");
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center dark:text-white">Verify Your Phone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Enter the verification code sent to your phone number:
          </div>
          
          <Input
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleVerifyCode}
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Didn't receive a code? 
            <Button variant="link" className="p-0 dark:text-blue-400 ml-1" onClick={onCancel}>
              Try again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;