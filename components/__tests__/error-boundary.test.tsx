import React from "react";
import { render } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(document.body.textContent).toContain("Test content");
  });

  it("should render error UI when error is thrown", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(document.body.textContent).toContain("Something went wrong");
    expect(document.body.textContent).toMatch(/An unexpected error occurred/i);
    const refreshBtn1 = Array.from(document.querySelectorAll("button")).find(
      (b) => /refresh page/i.test(b.textContent || "")
    );
    expect(refreshBtn1).toBeTruthy();
  });

  it("should render custom fallback when provided", () => {
    const CustomFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(document.body.textContent).toContain("Custom error message");
  });

  it("should reload page when refresh button is clicked", () => {
    const reloadMock = jest.fn();

    // Mock window.location.reload more safely
    delete (window as any).location;
    window.location = { ...window.location, reload: reloadMock } as any;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = Array.from(document.querySelectorAll("button")).find(
      (b) => /refresh page/i.test(b.textContent || "")
    ) as HTMLButtonElement | undefined;
    expect(refreshButton).toBeTruthy();
    refreshButton?.click();

    expect(reloadMock).toHaveBeenCalled();
  });
});
