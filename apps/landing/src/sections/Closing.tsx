import { Button } from "@abek/awesome-ui";
import { ArrowIcon, GitHubIcon } from "./Icons";
import { DOCS_URL, REPO_URL } from "../content";

export function Closing() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="cta">
            <h2 className="sectionTitle">Start with a button. Keep the rest.</h2>
            <p className="sectionLead">
              Install the package, or copy a single component into your own tree and own it
              from then on.
            </p>
            <div className="heroActions">
              <Button asChild size="lg" endIcon={<ArrowIcon />}>
                <a href={DOCS_URL}>Read the documentation</a>
              </Button>
              <Button asChild size="lg" variant="outline" startIcon={<GitHubIcon />}>
                <a href={REPO_URL} target="_blank" rel="noreferrer">Star on GitHub</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footerInner">
          <span className="footerNote">MIT © Abbosbek Sulaymonov</span>
          <nav className="footerLinks" aria-label="Footer">
            <a className="footerLink" href={DOCS_URL}>Documentation</a>
            <a className="footerLink" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a className="footerLink" href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">Issues</a>
            <a className="footerLink" href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
