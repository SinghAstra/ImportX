import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import React from "react";

const AuthNavbar = () => {
  return (
    <Link href={ROUTES.HOME}>
      <div className="border-b w-fit pb-2">
        <h1 className="text-xl mb-0.5">{siteConfig.name}</h1>
      </div>
    </Link>
  );
};

export default AuthNavbar;
