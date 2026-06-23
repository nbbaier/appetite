import React from "react";

interface EmptyStateProps {
  actions?: React.ReactNode;
  icon: React.ReactNode;
  message: string;
  subMessage: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon, message, subMessage, actions }) => (
    <div className="py-8 text-center sm:py-12">
      {icon}
      <h3 className="mb-2 font-medium text-base text-secondary-900 sm:text-lg">
        {message}
      </h3>
      <p className="mb-4 px-4 text-secondary-600 text-sm sm:text-base">
        {subMessage}
      </p>
      {actions && (
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          {actions}
        </div>
      )}
    </div>
  )
);
