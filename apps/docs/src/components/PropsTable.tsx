import propsData from "../generated/props.json";

interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: string;
}

interface InterfaceDoc {
  name: string;
  description?: string;
  props: PropDoc[];
}

const data = propsData as Record<string, InterfaceDoc[]>;

/**
 * Renders prop tables straight from `generated/props.json`, which the build
 * extracts from the TypeScript source. Nothing here is written by hand, so a
 * renamed prop shows up in the docs on the next build rather than quietly
 * going stale.
 */
export function PropsTable({ file, only }: { file: string; only?: string[] }) {
  const interfaces = data[file];

  if (!interfaces) {
    return <p className="prose">No prop data generated for {file}.</p>;
  }

  const shown = only ? interfaces.filter((entry) => only.includes(entry.name)) : interfaces;

  return (
    <>
      {shown.map((entry) => (
        <div key={entry.name}>
          <h3 className="interfaceName">{entry.name}</h3>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((prop) => (
                  <tr key={prop.name}>
                    <td className="propName">
                      {prop.name}
                      {prop.required ? (
                        <span className="propRequired" aria-label="required">
                          {" *"}
                        </span>
                      ) : null}
                    </td>
                    <td className="propType">{prop.type}</td>
                    <td className="propDefault">{prop.defaultValue ?? "—"}</td>
                    <td className="propDescription">
                      {prop.deprecated ? <strong>Deprecated. </strong> : null}
                      {prop.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="footerNote">
        Generated from the TypeScript source. Native element props are accepted as well
        and are omitted here.
      </p>
    </>
  );
}
