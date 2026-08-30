import { ThemeProvider, Toaster } from "@abek/awesome-ui";
import { CodeExample } from "./sections/CodeExample";
import { Closing } from "./sections/Closing";
import { Features } from "./sections/Features";
import { Hero } from "./sections/Hero";
import { Nav } from "./sections/Nav";
import { Showcase } from "./sections/Showcase";
import { Stats } from "./sections/Stats";

export function App() {
  return (
    <ThemeProvider>
      <div className="shell">
        <Nav />
        <main>
          <Hero />
          <Stats />
          <Features />
          <Showcase />
          <CodeExample />
          <Closing />
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
