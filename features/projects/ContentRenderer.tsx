type BaseContent = { title?: string };

type ContentData =
  | (BaseContent & { type: "TEXT"; data: { text: string } })
  | (BaseContent & { type: "IMAGE"; data: { url: string; alt?: string } })
  | (BaseContent & { type: "CODE"; data: { code: string } });


export default function ContentRenderer(props: ContentData) {
  const { type, data, title } = props;
  console.log("Rendering content of type:", type, "with data:", data);
  switch (type) {
    case "TEXT":
      if (title) {
        return (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p>{data.text}</p>
          </div>
        );
      }
      return <p className="mb-4">{data.text}</p>;
   case "IMAGE":
  return (
    <div className="mb-4">
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      <img src={data.url} alt={data.alt || ""} />
    </div>
  );
case "CODE":
  return (
    <div className="mb-4">
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      <pre className="bg-gray-800 text-white p-4 rounded">
        <code>{data.code}</code>
      </pre>
    </div>
  );
    default:
      return null;
  }
}
