import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { useUserContext } from "./user-provider";

export const InputUserName = () => {
  const { userName, setUserName } = useUserContext();

  const [inputValue, setInputValue] = useState(userName);

  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;

    console.log(`InputUserName Rendered: ${renderCount.current} times`);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setUserName(inputValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 border rounded-xl shadow-sm"
    >
      <h3 className="text-foreground font-medium text-lg">Update Username</h3>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter new username"
          className="bg-background text-foreground border-input/4 focus-visible:ring-ring/5"
        />
        <Button type="submit" className="bg-primary text-primary-foreground">
          Submit
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Global User:{" "}
        <span className="font-bold text-foreground">{userName}</span>
      </p>
    </form>
  );
};
