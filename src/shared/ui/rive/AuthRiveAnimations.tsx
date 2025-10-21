"use client";

import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

interface AuthRiveAnimationsProps {
  width?: number;
  height?: number;
}

export default function AuthRiveAnimations({ width = 700, height = 700 }: AuthRiveAnimationsProps) {
  const STATE_MACHINE = "Toggle Blending";

  const { rive, RiveComponent } = useRive({
    src: "/auth-animation.riv",
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const jumpInput = useStateMachineInput(rive, STATE_MACHINE, "Jump");

  // Логика фокусов на input/textarea
  useEffect(() => {
    if (!jumpInput) return;

    const handleFocus = () => {
      if ("fire" in jumpInput) jumpInput.fire();
    };

    const handleBlur = () => {
      if ("value" in jumpInput) jumpInput.value = false;
    };

    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach((el) => {
      el.addEventListener("focus", handleFocus);
      el.addEventListener("blur", handleBlur);
    });

    return () => {
      inputs.forEach((el) => {
        el.removeEventListener("focus", handleFocus);
        el.removeEventListener("blur", handleBlur);
      });
    };
  }, [jumpInput]);

  return (
    <div className="relative z-10" style={{ width, height }}>
      <RiveComponent />
    </div>
  );
}
