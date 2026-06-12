import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "@/App";

// jsdom smoke pass over the non-map views. The Leaflet heatmap needs a real
// browser and is covered by the Playwright e2e suite instead.

const heading = (name: RegExp) => screen.findByRole("heading", { level: 1, name });

describe("App smoke", () => {
  it("renders the Market Pulse dashboard by default", async () => {
    render(<App />);
    expect(await heading(/market pulse/i)).toBeInTheDocument();
    expect(screen.getByText("New Supply Pipeline")).toBeInTheDocument();
  });

  it("navigates between views from the sidebar", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /open \/ close/i }));
    expect(await heading(/open \/ close tracker/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /news desk/i }));
    expect(await heading(/news desk/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /deal pipeline/i }));
    expect(await heading(/deal pipeline/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /space finder/i }));
    expect(await heading(/space finder/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));
    expect(await heading(/market assistant/i)).toBeInTheDocument();
  });
});
