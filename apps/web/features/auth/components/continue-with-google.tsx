import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { GoogleLogo } from "@/lib/svg";
import { logError } from "@repo/shared";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

const ContinueWithGoogle = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleContinueWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);

      await signIn("google", {
        redirect: true,
        callbackUrl: ROUTES.DASHBOARD,
      });
    } catch (error) {
      logError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="w-full rounded-lg tracking-wide relative cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.98] py-2 px-3"
      onClick={handleContinueWithGoogle}
      disabled={isGoogleLoading}
      variant="outline"
    >
      {isGoogleLoading ? (
        <>
          <Loader className="size-4 animate-spin mr-2" />
          Wait ...
        </>
      ) : (
        <>
          <GoogleLogo className="mr-2" />
          <span className="text-center tracking-wide">
            Continue with Google
          </span>
        </>
      )}
    </Button>
  );
};

export default ContinueWithGoogle;
