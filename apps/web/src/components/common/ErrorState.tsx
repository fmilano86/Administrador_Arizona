import { TriangleAlert } from "lucide-react";

import { getErrorMessage } from "@/utils/errorUtils";

import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

export function ErrorState({
  error,
  onRetry,
  title = "No pudimos cargar esta información",
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <EmptyState
      icon={<TriangleAlert />}
      title={title}
      description={getErrorMessage(error)}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    />
  );
}
