import type { ReactNode } from "react";
import { features } from "../content";
import {
  AccessibilityIcon, BoxIcon, FeatherIcon, MoonIcon, PaletteIcon, TypeIcon,
} from "./Icons";

const ICONS: Record<string, ReactNode> = {
  accessibility: <AccessibilityIcon />,
  feather: <FeatherIcon />,
  palette: <PaletteIcon />,
  box: <BoxIcon />,
  moon: <MoonIcon />,
  type: <TypeIcon />,
};

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="sectionHead">
          <span className="eyebrow">Why this one</span>
          <h2 className="sectionTitle">Built the slow way, so you do not have to</h2>
          <p className="sectionLead">
            The behaviour most libraries pull from a dependency is written here and tested
            directly — which is the only reason it can be this small.
          </p>
        </div>

        <div className="featureGrid">
          {features.map((feature) => (
            <article className="feature" key={feature.title}>
              <span className="featureIcon" aria-hidden="true">{ICONS[feature.icon]}</span>
              <h3 className="featureTitle">{feature.title}</h3>
              <p className="featureBody">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
