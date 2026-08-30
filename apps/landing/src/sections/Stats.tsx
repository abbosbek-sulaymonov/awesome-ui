import { stats } from "../content";

export function Stats() {
  return (
    <section className="section">
      <div className="container stats">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <span className="statValue">{stat.value}</span>
            <span className="statLabel">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
