import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  subMessage: string;
  actions?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon, message, subMessage, actions }) => (
    <div className="py-8 text-center sm:py-12">
      {icon}
      <h3 className="mb-2 text-base font-medium sm:text-lg text-secondary-900">
        {message}
      </h3>
      <p className="px-4 mb-4 text-sm sm:text-base text-secondary-600">
        {subMessage}
      </p>
      {actions && (
        <div className="flex flex-col gap-2 justify-center sm:flex-row">
          {actions}
        </div>
      )}
    </div>
  ),
);
