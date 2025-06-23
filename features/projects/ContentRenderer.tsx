type ContentData =
  | { type: "TEXT"; data: { text: string } }
  | { type: "IMAGE"; data: { url: string; alt?: string } }
  | { type: "CODE"; data: { code: string } };

export default function ContentRenderer(props: ContentData) {
  const { type, data } = props;
  console.log("Rendering content of type:", type, "with data:", data);
  switch (type) {
    case "TEXT":
      return <p className="mb-4">{data.text}</p>;
    case "IMAGE":
      return <img src={data.url} alt={data.alt || ""} className="mb-4" />;
    case "CODE":
      return (
        <pre className="bg-gray-800 text-white p-4 rounded mb-4">
          <code>{data.code}</code>
        </pre>
      );
    default:
      return null;
  }
}
