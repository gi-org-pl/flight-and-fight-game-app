import { Outlet, Scripts } from "react-router";
import stylesheetHref from "./index.css?url";

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Flight and Fight | Generacja Innowacja</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Press+Start+2P"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css"
        />
        <link rel="stylesheet" href={stylesheetHref} />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
