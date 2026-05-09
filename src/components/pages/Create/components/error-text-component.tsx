import React from "react";

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-destructive mt-1">{children}</p>
);

export default ErrorText;
