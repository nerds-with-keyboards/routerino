import Routerino from "routerino";
import { routes, notFoundTemplate } from "./routes";

function App() {
  return (
    <Routerino
      routes={routes}
      title="Test App"
      titleSeparator=" | "
      notFoundTitle="404 Not Found"
      notFoundTemplate={
        <div>
          <h2>Route Not Found</h2>
          <p>This is a not found example component.</p>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate
            quisquam necessitatibus reprehenderit velit assumenda quidem nihil
            temporibus praesentium esse? Eum a recusandae enim magni placeat
            aliquam ullam facilis at iste.
          </p>
        </div>
      }
      errorTitle="Error"
      prerenderStatusCode={true}
      debug={
        typeof window !== "undefined" &&
        window.location?.host?.includes("localhost:")
      }
    />
  );
}

export default App;
export { routes, notFoundTemplate };
