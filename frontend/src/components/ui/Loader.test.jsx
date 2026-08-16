import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
  it("renders the loading indicator", () => {
    render(<Loader />);
    expect(screen.getByText("loading()")).toBeInTheDocument();
  });
});
